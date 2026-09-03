const introScroll = document.querySelector("#intro-scroll");
const introScreen = document.querySelector("#intro-screen");
const introVideoGrid = document.querySelector("#intro-video-grid");

const INTRO_GRID_SIZE = 4;
const INTRO_TILE_COUNT = INTRO_GRID_SIZE ** 2;
const INTRO_INITIAL_TILE_COUNT = 4;
const INTRO_FIRST_REVEAL = 120;
const INTRO_EXPANSION_START = 2200;
const INTRO_REVEAL_STEP = 110;
const INTRO_DEFERRED_LOAD_FALLBACK = INTRO_EXPANSION_START - 600;
const INTRO_MEDIA_VERSION = "6";
const INTRO_TILE_SOURCES = [
  "assets/H3-bid/ood-v1-selected__0042-000009_snow_village_krea_image_006__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0042-000085_cool_alpine_braided_river_valley_krea_image2_006__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0062-000014_cinematic_3d_environment_krea_image_001__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0107-000024_alpine_lake_krea_image_006__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0173-000048_temperate_tea_terraces_krea_image_019__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0278-000152_cool_twilight_stylized_mountain_lake_stone_pavilion_krea_image2_020__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0294-000157_warm_overcast_tropical_atoll_weather_station_causeway_krea_image2_002__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0462-000211_cool_morning_karst_river_canyon_boardwalk_krea_image_005__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0505-000232_cool_twilight_fantasy_basalt_fortress_chasm_courtyard_3d_krea_image2_006__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0548-000251_warm_moonlit_fantasy_limestone_bridge_cavern_krea_image2_019__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0543-000248_warm_overcast_red_sandstone_wadi_oasis_terrace_krea_image2_020__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0574-000266_cool_rainy_old_city_brick_arcade_drainage_courtyard_image_002__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0613-000287_warm_dusk_fantasy_glacier_observatory_courtyard_image_006__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0620-000293_cool_twilight_desert_mesa_rainwater_observatory_3d_image_005__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0556-000256_cool_dawn_highland_glacial_moraine_bridge_shelter_image2_003__minimax-h3-158f-step009000-live-v2-gen.mp4",
  "assets/H3-bid/ood-v1-selected__0698-solar_000252_warm_dawn_desert_solar_energy_visitor_center_brush_lettering_krea_image_005__minimax-h3-158f-step009000-live-v2-gen.mp4",
];

function buildIntroTileLayout() {
  const centerRow = (INTRO_GRID_SIZE - 1) / 2;
  const centerColumn = (INTRO_GRID_SIZE - 1) / 2;
  const coordinates = Array.from({ length: INTRO_TILE_COUNT }, (_, index) => ({
    index,
    row: Math.floor(index / INTRO_GRID_SIZE),
    column: index % INTRO_GRID_SIZE,
  }));

  coordinates.sort((a, b) => {
    const aRing = Math.max(Math.abs(a.row - centerRow), Math.abs(a.column - centerColumn));
    const bRing = Math.max(Math.abs(b.row - centerRow), Math.abs(b.column - centerColumn));
    if (aRing !== bRing) return aRing - bRing;

    const aAngle = Math.atan2(a.row - centerRow, a.column - centerColumn);
    const bAngle = Math.atan2(b.row - centerRow, b.column - centerColumn);
    return aAngle - bAngle;
  });

  return coordinates.map((coordinate, revealIndex) => ({
    ...coordinate,
    revealIndex,
  }));
}

function buildIntroVideoGrid(tiles) {
  if (!introVideoGrid) return [];
  const tilesByIndex = [...tiles].sort((a, b) => a.index - b.index);
  return tilesByIndex.map((tile, index) => {
    const frame = document.createElement("div");
    const video = document.createElement("video");
    const posterIndex = String(index + 1).padStart(2, "0");
    const isPriority = tile.revealIndex < INTRO_INITIAL_TILE_COUNT;
    frame.className = "intro-video-tile";
    frame.dataset.revealIndex = String(tile.revealIndex);
    video.dataset.poster = `assets/videos/intro-posters/tile-${posterIndex}.png?v=${INTRO_MEDIA_VERSION}`;
    video.dataset.src = `${INTRO_TILE_SOURCES[index]}?v=${INTRO_MEDIA_VERSION}`;
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = isPriority ? "auto" : "none";
    video.disablePictureInPicture = true;
    if (isPriority) {
      video.dataset.isActivated = "true";
      video.poster = video.dataset.poster;
      video.src = video.dataset.src;
    }
    frame.appendChild(video);
    introVideoGrid.appendChild(frame);
    return { frame, video, isPriority, ...tile };
  });
}

const introTiles = buildIntroTileLayout();
const introTileMedia = buildIntroVideoGrid(introTiles);
const introVideos = introTileMedia.map(({ video }) => video);
const logoSlot = document.querySelector("#logo-slot");
const logoMaskText = document.querySelector("#logo-mask-text");
const logoMaskFocus = document.querySelector("#logo-mask-focus");
const logoMaskLayer = document.querySelector("#logo-mask-layer");
const introVideoWall = document.querySelector("#intro-video-wall");
const coverLinks = document.querySelectorAll(".cover-link");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const animatedSolarMarks = [...document.querySelectorAll(".intro-start-logo .mark")];
const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];
const shouldStartAtCover = !window.location.hash
  || navigationEntry?.type === "reload"
  || navigationEntry?.type === "back_forward";
const enhancedViewport = window.matchMedia("(min-height: 635px) and (max-height: 1500px)");
let introEnhanced = !reduceMotion.matches
  && window.CSS?.supports?.("mix-blend-mode", "multiply")
  && enhancedViewport.matches;
let introRevealTimers = [];
let introPlaybackActive = !reduceMotion.matches;
let introDeferredMediaActivated = false;

const introPriorityMedia = introTileMedia.filter(({ isPriority }) => isPriority);
const introDeferredMedia = introTileMedia.filter(({ isPriority }) => !isPriority);

function activateIntroMedia({ video }) {
  if (video.dataset.isActivated === "true") return;
  video.dataset.isActivated = "true";
  video.poster = video.dataset.poster;
  video.src = video.dataset.src;
  video.preload = "auto";
  video.load();
  if (introPlaybackActive) video.play().catch(() => {});
}

function activateDeferredIntroMedia() {
  if (introDeferredMediaActivated) return;
  introDeferredMediaActivated = true;
  introDeferredMedia.forEach(activateIntroMedia);
}

function waitForIntroFirstFrame({ video }) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve();
  return new Promise((resolve) => {
    const finish = () => {
      video.removeEventListener("loadeddata", finish);
      video.removeEventListener("error", finish);
      resolve();
    };
    video.addEventListener("loadeddata", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
  });
}

Promise.all(introPriorityMedia.map(waitForIntroFirstFrame)).then(activateDeferredIntroMedia);
window.setTimeout(activateDeferredIntroMedia, INTRO_DEFERRED_LOAD_FALLBACK);

const solarSystems = animatedSolarMarks.map((mark) => ({
  mark,
  planets: [
    { element: mark.querySelector(".solar-planet--earth"), duration: 5.6, phase: .35 },
    { element: mark.querySelector(".solar-planet--jupiter"), duration: 9.4, phase: 2.55 },
    { element: mark.querySelector(".solar-planet--saturn"), duration: 13.8, phase: 4.75 },
  ].filter(({ element }) => element),
}));

let solarAnimationFrame = 0;
let solarLogoVisible = true;

function measureSolarSystems() {
  solarSystems.forEach((system) => {
    system.planets.forEach((planet) => {
      const orbit = planet.element.parentElement;
      planet.radiusX = orbit.clientWidth / 2;
      planet.radiusY = orbit.clientHeight / 2;
    });
  });
}

function paintSolarSystems(time) {
  solarAnimationFrame = 0;
  if (reduceMotion.matches || !solarLogoVisible) return;

  const seconds = time / 1000;
  solarSystems.forEach((system) => {
    system.planets.forEach((planet) => {
      const angle = planet.phase + ((seconds / planet.duration) * Math.PI * 2);
      const depth = (Math.sin(angle) + 1) / 2;
      const x = Math.cos(angle) * planet.radiusX;
      const y = Math.sin(angle) * planet.radiusY;
      const scale = .88 + (depth * .22);
      planet.element.style.left = "50%";
      planet.element.style.top = "50%";
      planet.element.style.opacity = (.7 + (depth * .3)).toFixed(3);
      planet.element.style.filter = `brightness(${(.82 + (depth * .3)).toFixed(3)})`;
      planet.element.style.transform = `translate(-50%,-50%) translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0) scale(${scale.toFixed(3)})`;
    });
  });

  solarAnimationFrame = window.requestAnimationFrame(paintSolarSystems);
}

function startSolarAnimation() {
  if (solarAnimationFrame || reduceMotion.matches || !solarLogoVisible) return;
  measureSolarSystems();
  solarAnimationFrame = window.requestAnimationFrame(paintSolarSystems);
}

if (solarSystems.length && !reduceMotion.matches) {
  startSolarAnimation();
  window.addEventListener("resize", measureSolarSystems, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      solarLogoVisible = entry.isIntersecting;
      if (solarLogoVisible) startSolarAnimation();
      else if (solarAnimationFrame) {
        window.cancelAnimationFrame(solarAnimationFrame);
        solarAnimationFrame = 0;
      }
    }, { threshold: 0 }).observe(animatedSolarMarks[0]);
  }
}

function applyIntroMode() {
  document.documentElement.classList.toggle("intro-enhanced", introEnhanced);
  document.documentElement.classList.toggle("intro-fallback", !introEnhanced);
}

applyIntroMode();

/* Apple ChipHero timing: 400x -> 1x over the first quarter of a 400vh
   sticky track, followed by a long, layered hand-off into the final hero. */
const MASK_END = 0.25;
const CONTENT_START = 0.29;
const CONTENT_END = 0.48;
const CONTENT_TITLE_LIFT = 96;
const CONTENT_SUPPORT_LIFT = 54;
const MASK_SOURCE_SCALE = 4;
const MASK_START_SCALE = 400 / MASK_SOURCE_SCALE;
const MASK_END_SCALE = 1 / MASK_SOURCE_SCALE;

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

function resetFreshVisit() {
  if (!shouldStartAtCover) return;
  window.scrollTo(0, 0);
  window.requestAnimationFrame(() => {
    window.scrollTo(0, 0);
    relayout();
  });
}

const easeOutCubic = (t) => 1 - ((1 - t) ** 3);
let maskStartX = 0;
let maskEndX = 0;

function measureMaskFocus() {
  if (!introScreen || !logoMaskText || !logoMaskFocus) return;
  const focusCenter = logoMaskFocus.offsetLeft + (logoMaskFocus.offsetWidth * 0.18);
  maskStartX = (logoMaskText.offsetWidth / 2) - focusCenter;
  maskEndX = maskStartX * (1 - MASK_END_SCALE);
  introScreen.style.setProperty("--mask-origin-x", `${focusCenter}px`);
}

function paintCamera() {
  if (!introScroll || !introScreen || !introEnhanced) return;

  const travel = introScroll.offsetHeight - introScreen.offsetHeight;
  const progress = travel > 0 ? clamp01(-introScroll.getBoundingClientRect().top / travel) : 1;

  const maskProgress = easeOutCubic(clamp01(progress / MASK_END));
  const scale = MASK_START_SCALE + ((MASK_END_SCALE - MASK_START_SCALE) * maskProgress);
  const x = maskStartX + ((maskEndX - maskStartX) * maskProgress);
  const reveal = easeOutCubic(clamp01((progress - CONTENT_START) / (CONTENT_END - CONTENT_START)));
  const horizontalShift = 0;

  const style = introScreen.style;
  style.setProperty("--mask-scale", scale.toFixed(4));
  style.setProperty("--mask-x", `${(x + horizontalShift).toFixed(3)}px`);
  style.setProperty("--mask-y", `${(-CONTENT_TITLE_LIFT * reveal).toFixed(2)}px`);
  style.setProperty("--content-x", `${horizontalShift.toFixed(2)}px`);
  style.setProperty("--blackout-opacity", "0");
  style.setProperty("--mask-opacity", "1");
  const settled = reveal > 0.985;
  style.setProperty("--word-mask-opacity", settled ? "0" : (1 - (reveal * .55)).toFixed(3));
  style.setProperty("--grid-shade-opacity", (reveal * .38).toFixed(3));
  style.setProperty("--grid-brightness", (1 - (reveal * .18)).toFixed(3));
  style.setProperty("--slot-opacity", reveal.toFixed(3));
  style.setProperty("--copy-opacity", reveal.toFixed(3));
  style.setProperty("--copy-y", `${(26 * (1 - reveal)).toFixed(2)}px`);
  style.setProperty("--title-lift", `${(-CONTENT_TITLE_LIFT * reveal).toFixed(2)}px`);
  style.setProperty("--support-lift", `${(-CONTENT_SUPPORT_LIFT * reveal).toFixed(2)}px`);
  style.setProperty("--hint-opacity", (1 - clamp01(progress / 0.08)).toFixed(3));
  introVideoWall?.classList.remove("is-hidden");
  logoMaskLayer?.classList.toggle("is-hidden", settled);
  introScreen.classList.toggle("is-settled", settled);
}

let camQueued = false;
let introCameraActive = true;
function queueCamera() {
  if (camQueued || !introCameraActive) return;
  camQueued = true;
  window.requestAnimationFrame(() => {
    camQueued = false;
    paintCamera();
  });
}

function relayout() {
  measureMaskFocus();
  paintCamera();
}

function settleFallback() {
  const style = introScreen?.style;
  style?.setProperty("--slot-opacity", "1");
  style?.setProperty("--copy-opacity", "1");
  style?.setProperty("--copy-y", "0px");
  style?.setProperty("--mask-y", `${-CONTENT_TITLE_LIFT}px`);
  style?.setProperty("--title-lift", `${-CONTENT_TITLE_LIFT}px`);
  style?.setProperty("--support-lift", `${-CONTENT_SUPPORT_LIFT}px`);
  style?.setProperty("--hint-opacity", "0");
  style?.setProperty("--blackout-opacity", "0");
  style?.setProperty("--mask-opacity", "1");
  style?.setProperty("--content-x", "0px");
  style?.setProperty("--word-mask-opacity", "0");
  style?.setProperty("--grid-shade-opacity", ".38");
  style?.setProperty("--grid-brightness", ".82");
  logoMaskLayer?.classList.add("is-hidden");
  introVideoWall?.classList.remove("is-hidden");
  introRevealTimers.forEach((timer) => window.clearTimeout(timer));
  introRevealTimers = [];
  introTileMedia.forEach(({ frame }) => frame.classList.add("is-visible"));
  introScreen?.classList.add("is-grid-ready");
  introScreen?.classList.add("is-grid-complete");
  introScreen?.classList.add("is-settled");
}

function startIntroGridSequence() {
  if (!introScreen || !introTileMedia.length) return;

  introRevealTimers.forEach((timer) => window.clearTimeout(timer));
  introRevealTimers = [];
  introScreen.classList.remove("is-grid-ready", "is-grid-complete");
  introTileMedia.forEach(({ frame, video, revealIndex }) => {
    frame.classList.remove("is-visible");
    if (video.readyState >= 1) video.currentTime = 0;
    if (video.dataset.isActivated === "true" || video.src) {
      video.play().catch(() => {});
    }
    const revealDelay = revealIndex < INTRO_INITIAL_TILE_COUNT
      ? INTRO_FIRST_REVEAL
      : INTRO_EXPANSION_START + ((revealIndex - INTRO_INITIAL_TILE_COUNT) * INTRO_REVEAL_STEP);
    introRevealTimers.push(window.setTimeout(
      () => frame.classList.add("is-visible"),
      revealDelay
    ));
  });

  introRevealTimers.push(window.setTimeout(
    () => introScreen.classList.add("is-grid-ready"),
    INTRO_EXPANSION_START
  ));
  introRevealTimers.push(window.setTimeout(
    () => introScreen.classList.add("is-grid-complete"),
    INTRO_EXPANSION_START + ((introTiles.length - INTRO_INITIAL_TILE_COUNT) * INTRO_REVEAL_STEP) + 360
  ));
}

enhancedViewport.addEventListener?.("change", (event) => {
  if (event.matches || !introEnhanced) return;
  introEnhanced = false;
  applyIntroMode();
  settleFallback();
});

if (introScreen && logoSlot) {
  if (shouldStartAtCover) {
    history.scrollRestoration = "manual";
    resetFreshVisit();
  }
  measureMaskFocus();
  if (!introEnhanced) {
    // Apple also disables the enhanced sequence outside a supported viewport.
    settleFallback();
  } else {
    startIntroGridSequence();
    paintCamera();
    window.addEventListener("scroll", queueCamera, { passive: true });
    if (introScroll && "IntersectionObserver" in window) {
      new IntersectionObserver(([entry]) => {
        introCameraActive = entry.isIntersecting;
        if (introCameraActive) queueCamera();
      }, { rootMargin: "120px 0px", threshold: 0 }).observe(introScroll);
    }
    window.addEventListener("resize", relayout);
    window.visualViewport?.addEventListener("resize", relayout);
    window.addEventListener("load", () => {
      resetFreshVisit();
    }, { once: true });
    window.addEventListener("pageshow", resetFreshVisit);
  }
}

/* The matrix is decorative: play only while the intro is on screen. */
if (introVideos.length) {
  const setPlaying = (playing) => {
    introPlaybackActive = playing;
    introVideos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      if (playing && (video.dataset.isActivated === "true" || video.src)) {
        video.play().catch(() => {});
      }
      else video.pause();
    });
  };

  introVideos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
  });

  if (reduceMotion.matches) {
    setPlaying(false);
  } else if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => entries.forEach((entry) => setPlaying(entry.isIntersecting)),
      { threshold: 0 }
    ).observe(introScreen);
  } else {
    setPlaying(true);
  }

  introTileMedia.forEach(({ frame, video }) => {
    video.addEventListener("error", () => {
      frame.classList.add("is-media-error");
    });
  });
}

function showCover(event) {
  event?.preventDefault();
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? "auto" : "smooth" });
}

const inDomainGalleryCases = [
  ["10s", "0038-000074_cool_autumn_woodland_reservoir_park_krea_image2_019-gen.mp4"],
  ["60s", "e730eed5dde558b57f44d432f554b11e89f528bb6349deedc86662d4e7d8ff22-gen.mp4"],
  ["10s", "0145-000035_alpine_weather_observatory_gpt_image_003-gen.mp4"],
  ["60s", "0189-000059_warm_subtropical_botanical_river_park_krea_image_007-gen.mp4"],
  ["10s", "27dfe771-3d05-5aa5-8624-8a1a20849157__160f-gen.mp4"],
  ["10s", "0122-000029_mountain_valley_gpt_image_004-gen.mp4"],
  ["60s", "6c7607b93213d683b32d368a38c1f83b755ec2190877bfd23ca4aa0fdf0cd24c-gen.mp4"],
  ["60s", "06abf5660e917df1350c1e98832395ff.mp4"],
  ["10s", "0042-000009_snow_village_krea_image_006-gen.mp4"],
  ["10s", "9583d98205c1_s3_0_10s-gen.mp4"],
  ["10s", "0155-000039_coastal_cliff_complex_gpt_image_004-gen.mp4"],
  ["10s", "0165-000042_mountain_railway_viaduct_gpt_image_003-gen.mp4"],
  ["10s", "0131-000031_tree_cliff_sanctuary_gpt_image_019-gen.mp4"],
  ["10s", "0548-000251_warm_moonlit_fantasy_limestone_bridge_cavern_krea_image2_019-gen.mp4"],
  ["10s", "0573-000265_cool_dawn_geothermal_greenhouse_complex_image2_006-gen.mp4"],
  ["10s", "0613-000287_warm_dusk_fantasy_glacier_observatory_courtyard_image_006-gen.mp4"],
  ["60s", "3e08eca5347e323cf8d073c430bc2bc6-gen.mp4"],
  ["10s", "0719-solar_00227_warm_evening_hillside_solar_research_center_large_brush_krea_image2_003-gen.mp4"],
  ["10s", "0643-000301_cool_overcast_arctic_icebreaker_dry_dock_image_020-gen.mp4"],
  ["60s", "00800200001_0027719_0029519-gen.mp4"],
  ["10s", "0649-000302_warm_morning_subtropical_citrus_packing_house_courtyard_image_020-gen.mp4"],
  ["60s", "14ea3a6bbb483c393c03ab35ac9fc02c.mp4"],
  ["10s", "0790f14b976d94c7-gen.mp4"],
  ["10s", "0851ec5d-313b-5d97-8335-e7d912b8895a__160f-gen.mp4"],
  ["60s", "1st_data_train_data-113_w02-gen.mp4"],
  ["10s", "008199dc-221a-5013-8774-8fa535c63c0a-gen.mp4"],
  ["60s", "00500100001_0051450_0053250-gen.mp4"],
  ["60s", "5542d1ac9edf8a875d6bbc7f0adf0b34.mp4"],
  ["10s", "155a0f729ec1_s6_0_10s-gen.mp4"],
  ["10s", "3a5867a7-2ba7-565a-969d-daa5352b9306-gen.mp4"],
  ["10s", "4d51fe06f931b1a571985a89feaeed50666501936c2cbdee7df0aa29bf5aa77e__160f_clip10-gen.mp4"],
  ["60s", "00500200001_0040650_0042450-gen.mp4"],
  ["10s", "997b7d4e-3876-53a4-b0bb-f5adba1c57d5-gen.mp4"],
  ["10s", "0115-000027_grand_library_gpt_image_005-gen.mp4"],
  ["10s", "0212-000096_cool_high_altitude_salt_lake_causeway_krea_image_004-gen.mp4"],
  ["10s", "0215-000198_cool_dawn_glacial_moraine_reservoir_boardwalk_krea_image_020-gen.mp4"],
  ["60s", "0196-000062_cool_foggy_fjord_road_krea_image_010-gen.mp4"],
  ["60s", "953425a8519179b00dade7f49dece446.mp4"],
  ["10s", "0278-000152_cool_twilight_stylized_mountain_lake_stone_pavilion_krea_image2_020-gen.mp4"],
  ["10s", "0288-000156_cool_night_desert_satellite_observatory_courtyard_krea_image2_004-gen.mp4"],
  ["10s", "0321-000166_warm_morning_tropical_limestone_waterfall_basin_krea_image2_006-gen.mp4"],
  ["60s", "0379-000188_cool_misty_alpine_granite_tarn_observation_shelter_krea_image_007-gen.mp4"],
  ["60s", "111-00500100001_0044250_0046050-gen.mp4"],
  ["10s", "0505-000232_cool_twilight_fantasy_basalt_fortress_chasm_courtyard_3d_krea_image2_006-gen.mp4"],
  ["60s", "0204-000086_cool_limestone_cloister_hall_krea_image_007-gen.mp4"],
  ["60s", "0205-000087_warm_fantasy_cliffside_citadel_courtyard_krea_image_010-gen.mp4"],
  ["60s", "0332-human_000269_warm_late_afternoon_jiangnan_lavender_hanfu_canal_corridor_image2_005-gen.mp4"],
  ["60s", "06b6f61f47c3f65e068cb91409ad6c08e5f33df3627dd7f6cc0a60fe4c8144d7-gen.mp4"],
  ["60s", "b780786d4f48e6e58afe1354e201dad6.mp4"],
  ["60s", "387174ad6e87daac4a5948dad2326673343d22e4dd29c8d63423047a47709b0b-gen.mp4"],
  ["60s", "0044-000009_snow_village_krea_image_010-gen.mp4"],
];

const modelDemoManifest = window.SOLARWM_MODEL_DEMOS || {};
const modelGalleryConfigs = {
  "wan-14b": {
    folder: "Wan2.2-14B-bid",
    label: "SolarWM-Wan-14B",
    note: "Generated by the SolarWM-Wan-14B Bidirectional Model",
    aspectRatio: "832 / 480",
    files: modelDemoManifest["wan-14b"] || [],
  },
  "ltx-2.5": {
    folder: "LTX-2.5-bid",
    label: "SolarWM-LTX-2.5",
    note: "Generated by the SolarWM-LTX-2.5 Bidirectional Model",
    aspectRatio: "768 / 512",
    files: modelDemoManifest["ltx-2.5"] || [],
  },
  "minimax-h3": {
    folder: "H3-bid",
    label: "SolarWM-Minimax-H3",
    note: "Generated by the SolarWM-Minimax-H3 Bidirectional Model",
    aspectRatio: "1344 / 768",
    files: modelDemoManifest["minimax-h3"] || [],
  },
};

function inDomainVideoUrl(group, filename) {
  return `assets/Wan2.2-5B-AR/${group}/${encodeURIComponent(filename)}`;
}

function galleryCase([group, filename], index) {
  const duration = group === "10s" ? "10-second" : "60-second";
  return {
    index,
    filename,
    label: `Case ${index + 1}, ${duration} generation`,
    src: inDomainVideoUrl(group, filename),
  };
}

function modelGalleryCase(config, filename, index) {
  return {
    index,
    label: `${config.label} generation ${index + 1}`,
    aspectRatio: config.aspectRatio,
    src: `assets/${config.folder}/${encodeURIComponent(filename)}`,
  };
}

function createGalleryCard(item, visibleIndex) {
  const article = document.createElement("article");
  const frame = document.createElement("div");
  const video = document.createElement("video");

  article.className = "case-video-card";
  frame.className = "case-video-frame";
  if (item.aspectRatio) frame.style.aspectRatio = item.aspectRatio;
  video.className = "case-grid-video";
  video.controls = true;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = "none";
  if (item.poster) video.poster = item.poster;
  video.dataset.src = item.src;
  video.setAttribute("aria-label", item.label);

  frame.append(video);
  article.append(frame);
  article.style.setProperty("--card-order", visibleIndex);
  return article;
}

function activateGalleryVideo(video) {
  if (!video.getAttribute("src") && video.dataset.src) {
    video.src = video.dataset.src;
    video.preload = "auto";
    video.load();
  }
}

const galleryVideoObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      if (entry.isIntersecting && entry.intersectionRatio >= .2) {
        activateGalleryVideo(video);
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, { rootMargin: "80px 0px", threshold: [0, .2, .55] })
  : null;

function observeGalleryVideos(grid) {
  grid.querySelectorAll("video").forEach((video) => {
    if (galleryVideoObserver) galleryVideoObserver.observe(video);
    else {
      activateGalleryVideo(video);
      video.play().catch(() => {});
    }
  });
}

function mountGallery({ gridId, items }) {
  const grid = document.querySelector(`#${gridId}`);
  if (!grid || !items.length) return;
  grid.querySelectorAll("video").forEach((video) => {
    galleryVideoObserver?.unobserve(video);
    video.pause();
    video.removeAttribute("src");
    video.load();
  });
  const fragment = document.createDocumentFragment();
  items.forEach((item, index) => fragment.appendChild(createGalleryCard(item, index)));
  grid.replaceChildren(fragment);
  observeGalleryVideos(grid);
}

const inDomainGalleryItems = inDomainGalleryCases.map(galleryCase);
mountGallery({
  gridId: "indomain-grid",
  items: inDomainGalleryItems,
});
const demoModelOptions = [...document.querySelectorAll("[data-demo-model]")];
const modelDemoContent = document.querySelector("#model-demo-content");
const modelBidirectionalContent = document.querySelector("#model-bidirectional-content");
const modelBidirectionalNote = document.querySelector("#model-bidirectional-note");
const bidirectionalGrid = document.querySelector("#bidirectional-grid");
let mountedDemoModel = "";

function selectDemoModel(selectedOption) {
  const model = selectedOption.dataset.demoModel;
  const isWan5B = model === "wan-5b";

  demoModelOptions.forEach((option) => {
    const isSelected = option === selectedOption;
    option.classList.toggle("is-active", isSelected);
    option.setAttribute("aria-pressed", String(isSelected));
  });

  modelDemoContent.hidden = !isWan5B;
  modelBidirectionalContent.hidden = isWan5B;

  if (!isWan5B) {
    const config = modelGalleryConfigs[model];
    if (config && mountedDemoModel !== model) {
      modelBidirectionalNote.textContent = config.note;
      bidirectionalGrid.setAttribute("aria-label", `${config.label} model generations`);
      mountGallery({
        gridId: "bidirectional-grid",
        items: config.files.map((filename, index) => modelGalleryCase(config, filename, index)),
      });
      mountedDemoModel = model;
    }
  }

  const hiddenContent = isWan5B ? modelBidirectionalContent : modelDemoContent;
  hiddenContent.querySelectorAll("video").forEach((video) => video.pause());
}

demoModelOptions.forEach((option) => {
  option.addEventListener("click", () => selectDemoModel(option));
});

coverLinks.forEach((link) => link.addEventListener("click", showCover));
