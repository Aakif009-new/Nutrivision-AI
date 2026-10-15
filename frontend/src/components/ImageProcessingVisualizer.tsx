'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  Camera,
  Filter,
  Palette,
  Binary,
  Scissors,
  ArrowRight,
  X,
  CheckCircle2,
  Sliders,
  Info
} from 'lucide-react';

interface ImageProcessingVisualizerProps {
  visualSteps: Record<string, string | undefined>;
  techniques: string[];
}

export interface StageDetail {
  key: string;
  stepNumber: number;
  title: string;
  academicConcept: string;
  algorithmApplied: string;
  whatHappens: string;
  visualEffect: string;
  downstreamBenefit: string;
}

export interface PipelineCategory {
  id: string;
  phaseNumber: number;
  phaseLabel: string;
  title: string;
  subtitle: string;
  iconName: 'camera' | 'filter' | 'palette' | 'binary' | 'scissors';
  color: {
    badge: string;
    lightBg: string;
    border: string;
    text: string;
    accent: string;
  };
  whyApplied: string;
  inputOutput: {
    input: string;
    output: string;
  };
  stepKeys: string[];
}

const STAGE_DETAILS: Record<string, StageDetail> = {
  step_1_original: {
    key: 'step_1_original',
    stepNumber: 1,
    title: 'Original Image Ingestion',
    academicConcept: 'Digital Image Acquisition',
    algorithmApplied: 'cv2.imdecode() / Sensor Buffer Ingestion',
    whatHappens: 'Captures the raw digital sensor matrix (3-channel BGR color array, H × W × 3) from the camera or file upload buffer without modification.',
    visualEffect: 'Displays unmodified digital photograph with native aspect ratio, sensor grain, and ambient room lighting.',
    downstreamBenefit: 'Provides the pure ground-truth spatial reference matrix against which all subsequent transformations and overlays are registered.'
  },
  step_2_resized: {
    key: 'step_2_resized',
    stepNumber: 2,
    title: 'Normalized Resolution',
    academicConcept: 'Bilinear Area Resampling',
    algorithmApplied: 'cv2.resize(img, (640, 640), interpolation=cv2.INTER_AREA)',
    whatHappens: 'Standardizes variable resolution camera frames to a canonical 640 × 640 spatial grid using pixel area decimation to prevent aliasing.',
    visualEffect: 'Aspect ratio and scale are normalized; high-frequency pixel jaggedness is smoothed without losing object structures.',
    downstreamBenefit: 'Establishes constant spatial scale factors (sx, sy) required for accurate metric calculations (area, bounding box) and deep neural networks.'
  },
  step_3_denoised_gaussian: {
    key: 'step_3_denoised_gaussian',
    stepNumber: 3,
    title: 'Gaussian Spatial Filter',
    academicConcept: 'Low-Pass Spatial Domain Filtering',
    algorithmApplied: 'cv2.GaussianBlur(img, (5, 5), sigmaX=1.2)',
    whatHappens: 'Convolves pixel neighborhoods with a 5×5 2D Gaussian kernel (σ=1.2), weighting nearby pixels exponentially higher to suppress high-frequency noise.',
    visualEffect: 'Attenuates camera sensor thermal grain and coarse lighting fluctuations across flat surfaces.',
    downstreamBenefit: 'Suppresses spurious high-frequency pixel variations that would otherwise cause erroneous false edges in gradient operators.'
  },
  step_4_denoised_median: {
    key: 'step_4_denoised_median',
    stepNumber: 4,
    title: 'Median Non-Linear Filter',
    academicConcept: 'Order-Statistic Non-Linear Filtering',
    algorithmApplied: 'cv2.medianBlur(gaussian_blur, ksize=5)',
    whatHappens: 'Slides a 5×5 ranking window over pixels, replacing each central pixel with the median intensity of its neighborhood.',
    visualEffect: 'Eliminates salt-and-pepper / impulse noise spikes completely while strictly preserving sharp object edge boundaries.',
    downstreamBenefit: 'Ensures homogeneous produce and background regions, which is essential for bimodal histogram separation during Otsu thresholding.'
  },
  step_5_hsv_colorspace: {
    key: 'step_5_hsv_colorspace',
    stepNumber: 5,
    title: 'HSV Cylindrical Mapping',
    academicConcept: 'Non-Linear Color Space Transformation',
    algorithmApplied: 'cv2.cvtColor(median_blur, cv2.COLOR_BGR2HSV)',
    whatHappens: 'Transforms correlated BGR color channels into cylindrical coordinates: Hue (dominant wavelength), Saturation (chroma purity), and Value (intensity).',
    visualEffect: 'Displayed as a pseudo-color array highlighting spectral color transitions independent of shadowing.',
    downstreamBenefit: 'Decouples chrominance from luminance, making color-based produce recognition and freshness evaluation invariant to varying illumination.'
  },
  step_6_clahe_contrast: {
    key: 'step_6_clahe_contrast',
    stepNumber: 6,
    title: 'CLAHE Contrast Enhancement',
    academicConcept: 'Adaptive Local Histogram Equalization',
    algorithmApplied: 'cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8,8)) on LAB L-Channel',
    whatHappens: 'Converts to perceptual CIE-LAB, splits the Luminance (L) channel into 8×8 contextual tiles, equalizes local histograms, and clips contrast at 2.5.',
    visualEffect: 'Reveals hidden skin textures, dark surface blemishes, bruise contours, and fine ripening patterns under uneven lighting.',
    downstreamBenefit: 'Significantly enhances feature saliency for the MobileNetV3 Produce Classifier and YOLO Quality Detector.'
  },
  step_7_otsu_threshold: {
    key: 'step_7_otsu_threshold',
    stepNumber: 7,
    title: 'Otsu Automated Binarization',
    academicConcept: 'Optimum Global Intra-Class Thresholding',
    algorithmApplied: 'cv2.threshold(gray, 0, 255, THRESH_BINARY + THRESH_OTSU) with border polarity auto-tuning',
    whatHappens: 'Analytically calculates the optimal intensity threshold t* that maximizes between-class variance between produce foreground and background.',
    visualEffect: 'Transforms continuous 8-bit grayscale into high-contrast 1-bit binary image (white foreground produce on black background).',
    downstreamBenefit: 'Automates segmentation without requiring manual threshold tuning, handling both bright kitchen counters and dark cutting boards.'
  },
  step_8_morphology_clean: {
    key: 'step_8_morphology_clean',
    stepNumber: 8,
    title: 'Morphological Filtering',
    academicConcept: 'Mathematical Morphology (Opening & Closing)',
    algorithmApplied: 'Opening (7x7 ellipse) followed by Closing (7x7 ellipse, 2 iterations)',
    whatHappens: 'Successive erosion-dilation (Opening) removes stray dust and specular noise specks; successive dilation-erosion (Closing) seals internal cavities and shadow holes.',
    visualEffect: 'Eradicates stray binary noise specks and transforms the segmented produce into a smooth, cohesive, solid binary silhouette.',
    downstreamBenefit: 'Prevents fragmented contours, ensuring exact perimeter and convex-hull calculations for downstream physical shape metrics.'
  },
  step_9_canny_edges: {
    key: 'step_9_canny_edges',
    stepNumber: 9,
    title: 'Canny Multi-Stage Edges',
    academicConcept: 'Optimal Gradient Boundary Detection',
    algorithmApplied: 'cv2.Canny(gray, threshold1=50, threshold2=150)',
    whatHappens: 'Computes directional Sobel gradients (Gx, Gy), applies Non-Maximum Suppression to thin edges to 1 pixel, and tracks edges via dual-threshold hysteresis.',
    visualEffect: 'Crisp 1-pixel white geometric boundaries showing produce silhouette and structural creases against a solid black backdrop.',
    downstreamBenefit: 'Validates structural integrity, enables precise boundary circularity analysis, and provides structural anchors for geometric validation.'
  },
  step_10_contours: {
    key: 'step_10_contours',
    stepNumber: 10,
    title: 'Topological Contour Analysis',
    academicConcept: 'Suzuki-Abe Border Following Algorithm',
    algorithmApplied: 'cv2.findContours(RETR_EXTERNAL, CHAIN_APPROX_SIMPLE) & Metric Computation',
    whatHappens: 'Extracts continuous outer boundary coordinates to calculate Green theorem surface area (A), perimeter (P), circularity (4πA/P²), and bounding boxes.',
    visualEffect: 'Overlays vibrant green outer contours, blue bounding boxes, and yellow indexing labels directly over the normalized produce image.',
    downstreamBenefit: 'Directly supplies empirical area and aspect ratio features to the Polynomial Weight Regressor to estimate produce weight in grams.'
  },
  step_11_segmented_foreground: {
    key: 'step_11_segmented_foreground',
    stepNumber: 11,
    title: 'Segmented Foreground Isolation',
    academicConcept: 'Bitwise Masked Conjunction',
    algorithmApplied: 'cv2.bitwise_and(resized_bgr, resized_bgr, mask=closed_mask)',
    whatHappens: 'Performs pixel-wise logical AND conjunction between normalized color image and the closed morphological mask, setting background pixels to (0,0,0).',
    visualEffect: 'Cleanly extracts the produce item in full natural color while replacing all distracting background, shadows, and plates with black.',
    downstreamBenefit: 'Feeds clean, background-subtracted image pixels into downstream deep learning classifiers to eliminate background context bias.'
  }
};

const PIPELINE_CATEGORIES: PipelineCategory[] = [
  {
    id: 'cat_acquisition',
    phaseNumber: 1,
    phaseLabel: 'Phase 1',
    title: 'Acquisition & Spatial Normalization',
    subtitle: 'Sensor ingestion and canonical coordinate standardization',
    iconName: 'camera',
    color: {
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      lightBg: 'bg-blue-50/60',
      border: 'border-blue-200/80',
      text: 'text-blue-900',
      accent: 'text-blue-600'
    },
    whyApplied: 'Standardizes input images from heterogeneous smartphone cameras and webcams into a uniform 640×640 spatial grid, ensuring isotropic pixel coordinates for consistent morphological and AI processing.',
    inputOutput: {
      input: 'Raw Device Frame (Heterogeneous H×W×3)',
      output: 'Normalized 640×640×3 BGR Array'
    },
    stepKeys: ['step_1_original', 'step_2_resized']
  },
  {
    id: 'cat_denoising',
    phaseNumber: 2,
    phaseLabel: 'Phase 2',
    title: 'Noise Attenuation & Spatial Filtering',
    subtitle: 'Linear Gaussian smoothing and rank-order impulse noise elimination',
    iconName: 'filter',
    color: {
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      lightBg: 'bg-emerald-50/60',
      border: 'border-emerald-200/80',
      text: 'text-emerald-900',
      accent: 'text-emerald-600'
    },
    whyApplied: 'Removes thermal sensor grain and salt-and-pepper noise without destroying object boundary edges, preventing false gradient spikes and broken segmentation masks in subsequent steps.',
    inputOutput: {
      input: 'Normalized BGR Image',
      output: 'Edge-Preserving Denoised Field'
    },
    stepKeys: ['step_3_denoised_gaussian', 'step_4_denoised_median']
  },
  {
    id: 'cat_color_contrast',
    phaseNumber: 3,
    phaseLabel: 'Phase 3',
    title: 'Color-Space Mapping & Contrast Enhancement',
    subtitle: 'Chrominance-luminance decoupling and adaptive local contrast equalisation',
    iconName: 'palette',
    color: {
      badge: 'bg-purple-100 text-purple-700 border-purple-200',
      lightBg: 'bg-purple-50/60',
      border: 'border-purple-200/80',
      text: 'text-purple-900',
      accent: 'text-purple-600'
    },
    whyApplied: 'Decouples color information from shadows by transforming to cylindrical HSV coordinates, and enhances subtle surface peel textures and freshness indicators using CLAHE on the LAB L-channel.',
    inputOutput: {
      input: 'Denoised BGR Array',
      output: 'Lighting-Invariant HSV & CLAHE Enhanced Field'
    },
    stepKeys: ['step_5_hsv_colorspace', 'step_6_clahe_contrast']
  },
  {
    id: 'cat_binarization',
    phaseNumber: 4,
    phaseLabel: 'Phase 4',
    title: 'Binarization & Mathematical Morphology',
    subtitle: 'Adaptive Otsu thresholding and structuring element cleanup',
    iconName: 'binary',
    color: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      lightBg: 'bg-amber-50/60',
      border: 'border-amber-200/80',
      text: 'text-amber-950',
      accent: 'text-amber-600'
    },
    whyApplied: 'Automatically segments foreground produce from background substrate using intra-class variance minimization, followed by Opening and Closing to eliminate reflections and seal internal voids.',
    inputOutput: {
      input: 'Grayscale Intensity Plane',
      output: 'Clean Contiguous Binary Mask (0/255)'
    },
    stepKeys: ['step_7_otsu_threshold', 'step_8_morphology_clean']
  },
  {
    id: 'cat_extraction',
    phaseNumber: 5,
    phaseLabel: 'Phase 5',
    title: 'Boundaries, Contours & Segmented Output',
    subtitle: 'Canny edge hysteresis, topological shape metrics, and masked produce isolation',
    iconName: 'scissors',
    color: {
      badge: 'bg-rose-100 text-rose-700 border-rose-200',
      lightBg: 'bg-rose-50/60',
      border: 'border-rose-200/80',
      text: 'text-rose-900',
      accent: 'text-rose-600'
    },
    whyApplied: 'Traces high-gradient edges with Canny, computes topological contour metrics (area, perimeter, circularity for weight estimation), and isolates pure produce pixels for the deep learning models.',
    inputOutput: {
      input: 'Binary Morphological Mask',
      output: 'Contour Metrics + Isolated Food Foreground'
    },
    stepKeys: ['step_9_canny_edges', 'step_10_contours', 'step_11_segmented_foreground']
  }
];

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case 'camera':
      return <Camera className={className || 'w-4 h-4'} />;
    case 'filter':
      return <Filter className={className || 'w-4 h-4'} />;
    case 'palette':
      return <Palette className={className || 'w-4 h-4'} />;
    case 'binary':
      return <Binary className={className || 'w-4 h-4'} />;
    case 'scissors':
      return <Scissors className={className || 'w-4 h-4'} />;
    default:
      return <Layers className={className || 'w-4 h-4'} />;
  }
}

export default function ImageProcessingVisualizer({ visualSteps, techniques }: ImageProcessingVisualizerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  const [selectedModalKey, setSelectedModalKey] = useState<string | null>(null);

  // Filter available steps that actually have image data
  const availableStepKeys = useMemo(() => {
    return Object.keys(visualSteps).filter((k) => Boolean(visualSteps[k]));
  }, [visualSteps]);

  // Keyboard navigation for modal (Escape, Left Arrow, Right Arrow)
  useEffect(() => {
    if (!selectedModalKey) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedModalKey(null);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = availableStepKeys.indexOf(selectedModalKey);
        if (currentIndex < availableStepKeys.length - 1) {
          setSelectedModalKey(availableStepKeys[currentIndex + 1]);
        }
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = availableStepKeys.indexOf(selectedModalKey);
        if (currentIndex > 0) {
          setSelectedModalKey(availableStepKeys[currentIndex - 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedModalKey, availableStepKeys]);

  if (availableStepKeys.length === 0) return null;

  // Filter categories to display
  const displayedCategories = activeCategoryFilter === 'all'
    ? PIPELINE_CATEGORIES
    : PIPELINE_CATEGORIES.filter((c) => c.id === activeCategoryFilter);

  // Modal active item lookup
  const activeModalStep = selectedModalKey ? STAGE_DETAILS[selectedModalKey] : null;
  const activeModalImage = selectedModalKey ? visualSteps[selectedModalKey] : null;
  const activeModalIndex = selectedModalKey ? availableStepKeys.indexOf(selectedModalKey) : -1;
  const activeModalCategory = selectedModalKey
    ? PIPELINE_CATEGORIES.find((c) => c.stepKeys.includes(selectedModalKey))
    : null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      {/* Top Accordion Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-slate-800">
                Image Processing Pipeline Architecture
              </h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                5 Algorithmic Phases • 11 Classical Stages
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Categorized OpenCV pipeline explaining the mathematical purpose and visual outcome of each algorithm
            </p>
          </div>
        </div>
        <div className="text-slate-400 group-hover:text-slate-600 transition-colors">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Main Expandable Content */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeCategoryFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All 5 Phases (11 Stages)</span>
            </button>

            {PIPELINE_CATEGORIES.map((cat) => {
              const count = cat.stepKeys.filter((k) => Boolean(visualSteps[k])).length;
              const isActive = activeCategoryFilter === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                    isActive
                      ? `${cat.color.badge} border-current shadow-sm`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CategoryIcon name={cat.iconName} className="w-3.5 h-3.5" />
                  <span>
                    {cat.phaseLabel}: {cat.title.split('&')[0].trim()}
                  </span>
                  <span className="ml-0.5 text-[10px] px-1.5 py-0.2 rounded-full bg-black/5 font-mono">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Categorized Phase Sections */}
          <div className="space-y-6">
            {displayedCategories.map((category) => {
              const presentSteps = category.stepKeys.filter((k) => Boolean(visualSteps[k]));
              if (presentSteps.length === 0) return null;

              return (
                <div
                  key={category.id}
                  className={`rounded-2xl border ${category.color.border} ${category.color.lightBg} p-5 transition-all`}
                >
                  {/* Category Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-200/60">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl bg-white shadow-xs border ${category.color.border} ${category.color.accent}`}>
                        <CategoryIcon name={category.iconName} className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${category.color.badge}`}>
                            {category.phaseLabel}
                          </span>
                          <h4 className={`text-sm font-bold ${category.color.text}`}>
                            {category.title}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {category.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Algorithmic Transformation Indicator */}
                    <div className="flex items-center gap-2 bg-white/90 border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] self-start md:self-auto shadow-xs">
                      <span className="font-medium text-slate-500">I/O:</span>
                      <span className="font-semibold text-slate-700">{category.inputOutput.input}</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className={`font-bold ${category.color.accent}`}>{category.inputOutput.output}</span>
                    </div>
                  </div>

                  {/* Why this algorithm is applied banner */}
                  <div className="mt-3.5 mb-4 px-3.5 py-2.5 rounded-xl bg-white/80 border border-slate-200/60 flex items-start gap-2.5">
                    <Info className={`w-4 h-4 mt-0.5 shrink-0 ${category.color.accent}`} />
                    <div className="text-xs text-slate-700 leading-relaxed">
                      <strong className="font-semibold text-slate-900">Why this phase is applied: </strong>
                      {category.whyApplied}
                    </div>
                  </div>

                  {/* Stage Cards Grid within Category */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 ${presentSteps.length >= 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4`}>
                    {presentSteps.map((key) => {
                      const stage = STAGE_DETAILS[key] || {
                        key,
                        stepNumber: 0,
                        title: key.replace(/_/g, ' ').toUpperCase(),
                        academicConcept: 'Image Transformation',
                        algorithmApplied: 'OpenCV Matrix Transformation',
                        whatHappens: 'Performs pixel-level mathematical transformation.',
                        visualEffect: 'Alters spatial or color representation.',
                        downstreamBenefit: 'Prepares image for analysis.'
                      };
                      const imgUrl = visualSteps[key]!;

                      return (
                        <div
                          key={key}
                          onClick={() => setSelectedModalKey(key)}
                          className="group relative bg-white border border-slate-200/90 rounded-xl overflow-hidden hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col"
                        >
                          {/* Image Box */}
                          <div className="aspect-[4/3] w-full bg-slate-950 flex items-center justify-center overflow-hidden relative">
                            <img
                              src={imgUrl}
                              alt={stage.title}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                            />
                            {/* Step Badge */}
                            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white border border-white/20">
                              Step {stage.stepNumber}
                            </div>
                            {/* Inspect Overlay */}
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-[1px]">
                              <Eye className="w-4 h-4" />
                              <span>Inspect Algorithm</span>
                            </div>
                          </div>

                          {/* Stage Details */}
                          <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2.5">
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                                  {stage.title}
                                </h5>
                              </div>
                              <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mt-0.5 line-clamp-1">
                                {stage.academicConcept}
                              </p>
                            </div>

                            {/* Applied Algorithm Code Snippet */}
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70 font-mono text-[10px] text-slate-700 truncate">
                              <span className="text-slate-400 select-none">fn: </span>
                              {stage.algorithmApplied}
                            </div>

                            {/* What Happens summary */}
                            <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                              {stage.whatHappens}
                            </p>

                            {/* Visual Impact Tag */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                              <span className="font-semibold text-slate-500">Visual Effect:</span>
                              <span className="text-slate-700 font-medium line-clamp-1 max-w-[70%] text-right">
                                {stage.visualEffect}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Applied Methods Summary Bar */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Verified OpenCV Image Processing Pipeline Operations:
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {techniques.map((tech, i) => (
                <span
                  key={i}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium flex items-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Deep Stage Inspection Modal with Sequential Navigation */}
      {selectedModalKey && activeModalStep && activeModalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedModalKey(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white font-mono">
                    Step {activeModalStep.stepNumber} of 11
                  </span>
                  {activeModalCategory && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${activeModalCategory.color.badge}`}>
                      {activeModalCategory.phaseLabel}: {activeModalCategory.title}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mt-1">
                  {activeModalStep.title}
                </h3>
                <p className="text-xs font-semibold text-emerald-600">
                  Academic Concept: {activeModalStep.academicConcept}
                </p>
              </div>

              <div className="flex items-center gap-1">
                {/* Navigation Buttons inside Modal */}
                <button
                  disabled={activeModalIndex <= 0}
                  onClick={() => setSelectedModalKey(availableStepKeys[activeModalIndex - 1])}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Step (Left Arrow)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={activeModalIndex >= availableStepKeys.length - 1}
                  onClick={() => setSelectedModalKey(availableStepKeys[activeModalIndex + 1])}
                  className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Step (Right Arrow)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedModalKey(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 ml-1"
                  title="Close Modal (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* High-Res Image Display */}
            <div className="bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center max-h-[380px] p-2">
              <img
                src={activeModalImage}
                alt={activeModalStep.title}
                className="max-h-[360px] w-auto object-contain rounded"
              />
            </div>

            {/* Detailed Explanation Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                  Algorithm & Function Applied
                </span>
                <p className="font-mono text-[11px] text-slate-700 bg-white p-1.5 rounded border border-slate-200">
                  {activeModalStep.algorithmApplied}
                </p>
                <p className="text-slate-600 text-[11px] pt-1">
                  {activeModalStep.whatHappens}
                </p>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl space-y-1">
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  Visual Transformation Effect
                </span>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  {activeModalStep.visualEffect}
                </p>
                <div className="pt-2 border-t border-emerald-100">
                  <span className="font-bold text-emerald-800">Downstream Pipeline Role:</span>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    {activeModalStep.downstreamBenefit}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer Quick Keyboard Guide */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Use ◀ and ▶ arrow keys to navigate steps</span>
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
