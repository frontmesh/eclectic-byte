interface SparkTuning {
	maxSparks: number;
	minSparks: number;
	areaPerSpark: number;
	speed: number;
	sway: number;
	repelRadius: number;
	repelForce: number;
	fpsCap: number;
	dprCap: number;
}

interface Spark {
	x: number;
	y: number;
	vx: number;
	vy: number;
	baseVx: number;
	baseVy: number;
	radius: number;
	alpha: number;
	swayAmplitude: number;
	swayFrequency: number;
	phase: number;
	spriteKey: string;
}

interface Rgb {
	r: number;
	g: number;
	b: number;
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(pointer: fine)";
const MAX_DELTA_SECONDS = 0.05;
const POINTER_LERP = 0.08;
const REPEL_DAMPING = 2.2;
const SWAY_BASELINE = 0.05;
const SWAY_JITTER = 0.06;
const SPEED_JITTER = 0.8;
const SPEED_FLOOR = 0.6;
const UPWARD_BIAS = 0.35;
const SPARK_RADIUS_FLOOR = 1.6;
const SPARK_RADIUS_JITTER = 2.6;
const SPARK_ALPHA_FLOOR = 0.16;
const SPARK_ALPHA_JITTER = 0.3;
const SWAY_AMPLITUDE_FLOOR = 6;
const SWAY_AMPLITUDE_JITTER = 14;
const SPARK_SPRITE_SIZE = 48;
const SPARK_SPRITE_STOPS: readonly [number, number, number] = [0, 0.35, 1];
const SPARK_SPRITE_ALPHAS: readonly [number, number, number] = [1, 0.42, 0];
const ORANGE_SPARK_WEIGHT = 3;
const DPR_FLOOR = 1;
const FPS_FLOOR_COARSE = 30;

const DEFAULT_TUNING: SparkTuning = {
	maxSparks: 110,
	minSparks: 26,
	areaPerSpark: 24000,
	speed: 9,
	sway: 1.4,
	repelRadius: 150,
	repelForce: 30,
	fpsCap: 60,
	dprCap: 1.5
};

function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

function readNumber(value: string | undefined, fallback: number, min: number, max: number): number {
	if (value === undefined) {
		return fallback;
	}

	const parsed = Number.parseFloat(value);
	if (Number.isNaN(parsed)) {
		return fallback;
	}

	return clamp(parsed, min, max);
}

function readTuning(dataset: DOMStringMap): SparkTuning {
	return {
		maxSparks: readNumber(dataset.maxSparks, DEFAULT_TUNING.maxSparks, 10, 400),
		minSparks: readNumber(dataset.minSparks, DEFAULT_TUNING.minSparks, 6, 100),
		areaPerSpark: readNumber(dataset.areaPerSpark, DEFAULT_TUNING.areaPerSpark, 8000, 200000),
		speed: readNumber(dataset.speed, DEFAULT_TUNING.speed, 1, 60),
		sway: readNumber(dataset.sway, DEFAULT_TUNING.sway, 0.1, 10),
		repelRadius: readNumber(dataset.repelRadius, DEFAULT_TUNING.repelRadius, 20, 600),
		repelForce: readNumber(dataset.repelForce, DEFAULT_TUNING.repelForce, 1, 200),
		fpsCap: readNumber(dataset.fpsCap, DEFAULT_TUNING.fpsCap, 10, 120),
		dprCap: readNumber(dataset.dprCap, DEFAULT_TUNING.dprCap, DPR_FLOOR, 3)
	};
}

function parseHexColor(value: string): Rgb | undefined {
	const trimmed = value.trim().replace("#", "");
	const normalized = trimmed.length === 3 ? trimmed.replace(/./g, (char) => char + char) : trimmed;

	if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
		return undefined;
	}

	const numeric = Number.parseInt(normalized, 16);
	return {
		r: (numeric >> 16) & 255,
		g: (numeric >> 8) & 255,
		b: numeric & 255
	};
}

function toRgba(color: Rgb, alpha: number): string {
	return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

function readPalette(root: HTMLElement | null): Rgb[] {
	const source = root ?? document.documentElement;
	const styles = getComputedStyle(source);
	const orange = parseHexColor(styles.getPropertyValue("--color-brand-orange"));
	const navy = parseHexColor(styles.getPropertyValue("--color-brand-navy"));

	const palette: Rgb[] = [];
	for (let index = 0; index < ORANGE_SPARK_WEIGHT; index += 1) {
		if (orange) {
			palette.push(orange);
		}
	}
	if (navy) {
		palette.push(navy);
	}

	return palette;
}

function createSparkSprite(color: Rgb): HTMLCanvasElement | undefined {
	const sprite = document.createElement("canvas");
	sprite.width = SPARK_SPRITE_SIZE;
	sprite.height = SPARK_SPRITE_SIZE;

	const context = sprite.getContext("2d");
	if (!context) {
		return undefined;
	}

	const center = SPARK_SPRITE_SIZE / 2;
	const gradient = context.createRadialGradient(center, center, 0, center, center, center);
	SPARK_SPRITE_STOPS.forEach((stop, index) => {
		gradient.addColorStop(stop, toRgba(color, SPARK_SPRITE_ALPHAS[index] ?? 0));
	});

	context.fillStyle = gradient;
	context.fillRect(0, 0, SPARK_SPRITE_SIZE, SPARK_SPRITE_SIZE);
	return sprite;
}

export function initBackgroundScene(canvas: HTMLCanvasElement): () => void {
	const canvasContext = canvas.getContext("2d");
	if (!canvasContext) {
		return () => {};
	}

	const context: CanvasRenderingContext2D = canvasContext;

	const root = canvas.closest<HTMLElement>("[data-scene-root]");
	const tuning = readTuning(canvas.dataset);
	const palette = readPalette(root);
	const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY);
	const finePointer = window.matchMedia(FINE_POINTER_QUERY);
	const effectiveFpsCap = finePointer.matches ? tuning.fpsCap : Math.min(tuning.fpsCap, FPS_FLOOR_COARSE);
	const frameInterval = 1000 / effectiveFpsCap;
	const sprites = new Map<string, HTMLCanvasElement>();

	let sparks: Spark[] = [];
	let width = 0;
	let height = 0;
	let running = false;
	let animationFrame = 0;
	let lastTimestamp = 0;
	let elapsed = 0;
	const pointer = { targetX: 0, targetY: 0, x: 0, y: 0, pixelX: 0, pixelY: 0, active: false };

	function sparkCount(): number {
		const byArea = Math.round((width * height) / tuning.areaPerSpark);
		return clamp(byArea, tuning.minSparks, tuning.maxSparks);
	}

	function spriteKeyFor(color: Rgb): string {
		return `${color.r},${color.g},${color.b}`;
	}

	function createSpark(): Spark | undefined {
		const color = palette[Math.floor(Math.random() * palette.length)];
		if (!color) {
			return undefined;
		}

		const spriteKey = spriteKeyFor(color);
		if (!sprites.has(spriteKey)) {
			const sprite = createSparkSprite(color);
			if (!sprite) {
				return undefined;
			}
			sprites.set(spriteKey, sprite);
		}

		const direction = Math.random() * Math.PI * 2;
		const speed = tuning.speed * (SPEED_FLOOR + Math.random() * SPEED_JITTER);

		return {
			x: Math.random() * width,
			y: Math.random() * height,
			vx: 0,
			vy: 0,
			baseVx: Math.cos(direction) * speed,
			baseVy: Math.sin(direction) * speed - speed * UPWARD_BIAS,
			radius: SPARK_RADIUS_FLOOR + Math.random() * SPARK_RADIUS_JITTER,
			alpha: SPARK_ALPHA_FLOOR + Math.random() * SPARK_ALPHA_JITTER,
			swayAmplitude: (SWAY_AMPLITUDE_FLOOR + Math.random() * SWAY_AMPLITUDE_JITTER) * tuning.sway,
			swayFrequency: SWAY_BASELINE + Math.random() * SWAY_JITTER,
			phase: Math.random() * Math.PI * 2,
			spriteKey
		};
	}

	function seedSparks(): void {
		if (palette.length === 0) {
			sparks = [];
			return;
		}

		const target = sparkCount();
		while (sparks.length < target) {
			const spark = createSpark();
			if (!spark) {
				break;
			}
			sparks.push(spark);
		}
		if (sparks.length > target) {
			sparks.length = target;
		}
	}

	function resize(): void {
		const dpr = clamp(window.devicePixelRatio || 1, DPR_FLOOR, tuning.dprCap);
		const nextWidth = window.innerWidth;
		const nextHeight = window.innerHeight;

		canvas.width = Math.round(nextWidth * dpr);
		canvas.height = Math.round(nextHeight * dpr);
		canvas.style.width = `${nextWidth}px`;
		canvas.style.height = `${nextHeight}px`;
		context.setTransform(dpr, 0, 0, dpr, 0, 0);

		width = nextWidth;
		height = nextHeight;
		seedSparks();
	}

	function step(delta: number): void {
		const damping = 1 - Math.exp(-delta * REPEL_DAMPING);
		elapsed += delta;

		for (const spark of sparks) {
			if (pointer.active) {
				const dx = spark.x - pointer.pixelX;
				const dy = spark.y - pointer.pixelY;
				const distance = Math.hypot(dx, dy);

				if (distance > 0 && distance < tuning.repelRadius) {
					const strength = (1 - distance / tuning.repelRadius) * tuning.repelForce;
					spark.vx += (dx / distance) * strength * delta;
					spark.vy += (dy / distance) * strength * delta;
				}
			}

			spark.vx += (spark.baseVx - spark.vx) * damping;
			spark.vy += (spark.baseVy - spark.vy) * damping;
			spark.x += spark.vx * delta;
			spark.y += spark.vy * delta;

			const margin = spark.radius * 4;
			if (spark.x < -margin) {
				spark.x = width + margin;
			} else if (spark.x > width + margin) {
				spark.x = -margin;
			}

			if (spark.y < -margin) {
				spark.y = height + margin;
			} else if (spark.y > height + margin) {
				spark.y = -margin;
			}
		}
	}

	function draw(): void {
		context.clearRect(0, 0, width, height);

		for (const spark of sparks) {
			const sprite = sprites.get(spark.spriteKey);
			if (!sprite) {
				continue;
			}

			const sway = Math.sin(elapsed * spark.swayFrequency * Math.PI * 2 + spark.phase) * spark.swayAmplitude;
			const size = spark.radius * 4;
			context.globalAlpha = spark.alpha;
			context.drawImage(sprite, spark.x + sway - size / 2, spark.y - size / 2, size, size);
		}

		context.globalAlpha = 1;
	}

	function applyPointerToScene(): void {
		if (!root) {
			return;
		}

		pointer.x += (pointer.targetX - pointer.x) * POINTER_LERP;
		pointer.y += (pointer.targetY - pointer.y) * POINTER_LERP;
		root.style.setProperty("--scene-pointer-x", pointer.x.toFixed(4));
		root.style.setProperty("--scene-pointer-y", pointer.y.toFixed(4));
	}

	function frame(timestamp: number): void {
		if (!running) {
			return;
		}

		animationFrame = window.requestAnimationFrame(frame);

		if (lastTimestamp === 0) {
			lastTimestamp = timestamp;
			return;
		}

		const elapsedMs = timestamp - lastTimestamp;
		if (elapsedMs < frameInterval - 1) {
			return;
		}

		lastTimestamp = timestamp;
		const delta = Math.min(elapsedMs / 1000, MAX_DELTA_SECONDS);

		applyPointerToScene();
		step(delta);
		draw();
	}

	function onPointerMove(event: PointerEvent): void {
		pointer.targetX = (event.clientX / Math.max(width, 1)) * 2 - 1;
		pointer.targetY = (event.clientY / Math.max(height, 1)) * 2 - 1;
		pointer.pixelX = event.clientX;
		pointer.pixelY = event.clientY;
		pointer.active = true;
	}

	function start(): void {
		if (running || reduceMotion.matches || document.visibilityState !== "visible") {
			return;
		}

		running = true;
		lastTimestamp = 0;
		animationFrame = window.requestAnimationFrame(frame);
	}

	function stop(): void {
		running = false;
		window.cancelAnimationFrame(animationFrame);
	}

	function onVisibilityChange(): void {
		if (document.visibilityState === "visible") {
			start();
		} else {
			stop();
		}
	}

	function onMotionChange(): void {
		if (reduceMotion.matches) {
			stop();
			if (root) {
				root.style.removeProperty("--scene-pointer-x");
				root.style.removeProperty("--scene-pointer-y");
			}
		} else {
			start();
		}
	}

	function onResize(): void {
		resize();
		if (!running) {
			draw();
		}
	}

	resize();

	window.addEventListener("resize", onResize, { passive: true });
	document.addEventListener("visibilitychange", onVisibilityChange);
	reduceMotion.addEventListener("change", onMotionChange);

	if (finePointer.matches) {
		window.addEventListener("pointermove", onPointerMove, { passive: true });
	}

	start();

	return () => {
		stop();
		window.removeEventListener("resize", onResize);
		document.removeEventListener("visibilitychange", onVisibilityChange);
		reduceMotion.removeEventListener("change", onMotionChange);
		window.removeEventListener("pointermove", onPointerMove);
	};
}
