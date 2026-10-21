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

interface BokehTuning {
	minWidth: number;
	minCount: number;
	maxCount: number;
	widthDivisor: number;
	radiusMin: number;
	radiusMax: number;
	alphaMin: number;
	alphaMax: number;
}

interface BokehStyle {
	color: Rgb;
	alphaScale: number;
}

interface BokehBlob {
	x: number;
	y: number;
	vx: number;
	vy: number;
	radius: number;
	peakAlpha: number;
	alphaScale: number;
	life: number;
	period: number;
	swayAmplitude: number;
	swayFrequency: number;
	swayPhase: number;
	spriteKey: string;
	depthAxis: "x" | "y";
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
const BOKEH_ORANGE_WEIGHT = 4;
const BOKEH_NAVY_ALPHA_SCALE = 0.45;
const BOKEH_SPEED_FLOOR = 3;
const BOKEH_SPEED_JITTER = 4;
const BOKEH_RADIUS_MARGIN = 0.6;
const BOKEH_BAND_FRACTION = 0.22;
const BOKEH_SIDE_LEFT = 0.35;
const BOKEH_SIDE_RIGHT = 0.7;
const BOKEH_SIDE_TOP = 0.85;
const BOKEH_PERIOD_FLOOR = 20;
const BOKEH_PERIOD_JITTER = 20;
const BOKEH_SWAY_AMPLITUDE_FLOOR = 10;
const BOKEH_SWAY_AMPLITUDE_JITTER = 14;
const BOKEH_SWAY_BASELINE = 0.02;
const BOKEH_SWAY_JITTER = 0.04;
const BOKEH_BOUNCE_MARGIN = 0.5;

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

const DEFAULT_BOKEH_TUNING: BokehTuning = {
	minWidth: 1200,
	minCount: 20,
	maxCount: 34,
	widthDivisor: 62,
	radiusMin: 36,
	radiusMax: 100,
	alphaMin: 0.05,
	alphaMax: 0.11
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

function readBokehTuning(dataset: DOMStringMap): BokehTuning {
	return {
		minWidth: readNumber(dataset.bokehMinWidth, DEFAULT_BOKEH_TUNING.minWidth, 0, 4000),
		minCount: readNumber(dataset.bokehMin, DEFAULT_BOKEH_TUNING.minCount, 0, 200),
		maxCount: readNumber(dataset.bokehMax, DEFAULT_BOKEH_TUNING.maxCount, 1, 300),
		widthDivisor: readNumber(dataset.bokehPerWidth, DEFAULT_BOKEH_TUNING.widthDivisor, 10, 1000),
		radiusMin: readNumber(dataset.bokehRadiusMin, DEFAULT_BOKEH_TUNING.radiusMin, 4, 400),
		radiusMax: readNumber(dataset.bokehRadiusMax, DEFAULT_BOKEH_TUNING.radiusMax, 8, 600),
		alphaMin: readNumber(dataset.bokehAlphaMin, DEFAULT_BOKEH_TUNING.alphaMin, 0, 1),
		alphaMax: readNumber(dataset.bokehAlphaMax, DEFAULT_BOKEH_TUNING.alphaMax, 0, 1)
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

interface BrandColors {
	orange: Rgb | undefined;
	navy: Rgb | undefined;
}

function readBrandColors(root: HTMLElement | null): BrandColors {
	const source = root ?? document.documentElement;
	const styles = getComputedStyle(source);

	return {
		orange: parseHexColor(styles.getPropertyValue("--color-brand-orange")),
		navy: parseHexColor(styles.getPropertyValue("--color-brand-navy"))
	};
}

function sparkPalette(colors: BrandColors): Rgb[] {
	const palette: Rgb[] = [];
	for (let index = 0; index < ORANGE_SPARK_WEIGHT; index += 1) {
		if (colors.orange) {
			palette.push(colors.orange);
		}
	}
	if (colors.navy) {
		palette.push(colors.navy);
	}

	return palette;
}

function bokehStyles(colors: BrandColors): BokehStyle[] {
	const styles: BokehStyle[] = [];
	for (let index = 0; index < BOKEH_ORANGE_WEIGHT; index += 1) {
		if (colors.orange) {
			styles.push({ color: colors.orange, alphaScale: 1 });
		}
	}
	if (colors.navy) {
		styles.push({ color: colors.navy, alphaScale: BOKEH_NAVY_ALPHA_SCALE });
	}

	return styles;
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
	const brandColors = readBrandColors(root);
	const palette = sparkPalette(brandColors);
	const edgeStyles = bokehStyles(brandColors);
	const bokehTuning = readBokehTuning(canvas.dataset);
	const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY);
	const finePointer = window.matchMedia(FINE_POINTER_QUERY);
	const edgeQuery = window.matchMedia(`(min-width: ${bokehTuning.minWidth}px)`);
	const effectiveFpsCap = finePointer.matches ? tuning.fpsCap : Math.min(tuning.fpsCap, FPS_FLOOR_COARSE);
	const frameInterval = 1000 / effectiveFpsCap;
	const sprites = new Map<string, HTMLCanvasElement>();

	let sparks: Spark[] = [];
	let bokeh: BokehBlob[] = [];
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

	function bokehCount(): number {
		const byWidth = Math.round(width / bokehTuning.widthDivisor);
		return clamp(byWidth, bokehTuning.minCount, bokehTuning.maxCount);
	}

	function placeBokeh(blob: BokehBlob): void {
		const radiusSpan = bokehTuning.radiusMax - bokehTuning.radiusMin;
		const alphaSpan = bokehTuning.alphaMax - bokehTuning.alphaMin;
		const speed = BOKEH_SPEED_FLOOR + Math.random() * BOKEH_SPEED_JITTER;
		const sign = Math.random() < 0.5 ? -1 : 1;

		blob.radius = bokehTuning.radiusMin + Math.random() * radiusSpan;
		blob.peakAlpha = bokehTuning.alphaMin + Math.random() * alphaSpan;
		blob.life = 0;
		blob.period = BOKEH_PERIOD_FLOOR + Math.random() * BOKEH_PERIOD_JITTER;
		blob.swayAmplitude = BOKEH_SWAY_AMPLITUDE_FLOOR + Math.random() * BOKEH_SWAY_AMPLITUDE_JITTER;
		blob.swayFrequency = BOKEH_SWAY_BASELINE + Math.random() * BOKEH_SWAY_JITTER;
		blob.swayPhase = Math.random() * Math.PI * 2;
		blob.vx = 0;
		blob.vy = 0;

		const radiusMargin = blob.radius * BOKEH_RADIUS_MARGIN;
		const bandX = width * BOKEH_BAND_FRACTION;
		const bandY = height * BOKEH_BAND_FRACTION;
		const roll = Math.random();
		if (roll < BOKEH_SIDE_LEFT) {
			blob.depthAxis = "x";
			blob.x = -radiusMargin + Math.random() * (bandX + radiusMargin);
			blob.y = Math.random() * height;
			blob.vy = sign * speed;
		} else if (roll < BOKEH_SIDE_RIGHT) {
			blob.depthAxis = "x";
			blob.x = width + radiusMargin - Math.random() * (bandX + radiusMargin);
			blob.y = Math.random() * height;
			blob.vy = sign * speed;
		} else if (roll < BOKEH_SIDE_TOP) {
			blob.depthAxis = "y";
			blob.x = Math.random() * width;
			blob.y = -radiusMargin + Math.random() * (bandY + radiusMargin);
			blob.vx = sign * speed;
		} else {
			blob.depthAxis = "y";
			blob.x = Math.random() * width;
			blob.y = height + radiusMargin - Math.random() * (bandY + radiusMargin);
			blob.vx = sign * speed;
		}
	}

	function createBokeh(): BokehBlob | undefined {
		const style = edgeStyles[Math.floor(Math.random() * edgeStyles.length)];
		if (!style) {
			return undefined;
		}

		const spriteKey = spriteKeyFor(style.color);
		if (!sprites.has(spriteKey)) {
			const sprite = createSparkSprite(style.color);
			if (!sprite) {
				return undefined;
			}
			sprites.set(spriteKey, sprite);
		}

		const blob: BokehBlob = {
			x: 0,
			y: 0,
			vx: 0,
			vy: 0,
			radius: 0,
			peakAlpha: 0,
			alphaScale: style.alphaScale,
			life: 0,
			period: 1,
			swayAmplitude: 0,
			swayFrequency: 0,
			swayPhase: 0,
			spriteKey,
			depthAxis: "x"
		};
		placeBokeh(blob);
		return blob;
	}

	function seedBokeh(): void {
		if (!edgeQuery.matches || edgeStyles.length === 0) {
			bokeh = [];
			return;
		}

		const target = bokehCount();
		while (bokeh.length < target) {
			const blob = createBokeh();
			if (!blob) {
				break;
			}
			bokeh.push(blob);
		}
		if (bokeh.length > target) {
			bokeh.length = target;
		}
	}

	function bounceBokeh(blob: BokehBlob): void {
		const limit = blob.radius * BOKEH_BOUNCE_MARGIN;

		if (blob.depthAxis === "x") {
			if (blob.y < -limit) {
				blob.y = -limit;
				blob.vy = Math.abs(blob.vy);
			} else if (blob.y > height + limit) {
				blob.y = height + limit;
				blob.vy = -Math.abs(blob.vy);
			}
			return;
		}

		if (blob.x < -limit) {
			blob.x = -limit;
			blob.vx = Math.abs(blob.vx);
		} else if (blob.x > width + limit) {
			blob.x = width + limit;
			blob.vx = -Math.abs(blob.vx);
		}
	}

	function stepBokeh(delta: number): void {
		for (const blob of bokeh) {
			blob.life += delta;
			if (blob.life >= blob.period) {
				placeBokeh(blob);
				continue;
			}

			if (blob.depthAxis === "x") {
				blob.y += blob.vy * delta;
			} else {
				blob.x += blob.vx * delta;
			}
			bounceBokeh(blob);
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
		seedBokeh();
	}

	function step(delta: number): void {
		const damping = 1 - Math.exp(-delta * REPEL_DAMPING);
		elapsed += delta;
		stepBokeh(delta);

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

		for (const blob of bokeh) {
			const sprite = sprites.get(blob.spriteKey);
			if (!sprite) {
				continue;
			}

			const envelope = Math.max(Math.sin(Math.PI * (blob.life / blob.period)), 0);
			if (envelope <= 0) {
				continue;
			}

			const sway = Math.sin(elapsed * blob.swayFrequency * Math.PI * 2 + blob.swayPhase) * blob.swayAmplitude;
			const size = blob.radius * 2;
			const offsetX = blob.depthAxis === "x" ? sway : 0;
			const offsetY = blob.depthAxis === "y" ? sway : 0;

			context.globalAlpha = blob.peakAlpha * blob.alphaScale * envelope;
			context.drawImage(sprite, blob.x + offsetX - size / 2, blob.y + offsetY - size / 2, size, size);
		}

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

	function onEdgeChange(): void {
		seedBokeh();
		if (!running) {
			draw();
		}
	}

	resize();

	window.addEventListener("resize", onResize, { passive: true });
	document.addEventListener("visibilitychange", onVisibilityChange);
	reduceMotion.addEventListener("change", onMotionChange);
	edgeQuery.addEventListener("change", onEdgeChange);

	if (finePointer.matches) {
		window.addEventListener("pointermove", onPointerMove, { passive: true });
	}

	start();

	return () => {
		stop();
		window.removeEventListener("resize", onResize);
		document.removeEventListener("visibilitychange", onVisibilityChange);
		reduceMotion.removeEventListener("change", onMotionChange);
		edgeQuery.removeEventListener("change", onEdgeChange);
		window.removeEventListener("pointermove", onPointerMove);
	};
}
