'use client';

import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronUp, Eye, Info, Sparkles } from 'lucide-react';

interface ImageProcessingVisualizerProps {
  visualSteps: Record<string, string | undefined>;
  techniques: string[];
}

const STEP_DESCRIPTIONS: Record<string, { title: string; academicConcept: string; description: string }> = {
  step_1_original: {
    title: "1. Original Acquisition",
    academicConcept: "Digital Image Acquisition",
    description: "Raw BGR digital matrix captured via webcam sensor or file upload buffer."
  },
  step_2_resized: {
    title: "2. Normalized Resolution",
    academicConcept: "Spatial Sampling & Interpolation",
    description: "Bilinear area interpolation resizing to standardized (640x640) spatial dimension."
  },
  step_3_denoised_gaussian: {
    title: "3. Gaussian Spatial Filter",
    academicConcept: "Low-Pass Spatial Filtering",
    description: "Convolution with 5x5 Gaussian kernel (sigma=1.2) to attenuate high-frequency sensor noise."
  },
  step_4_denoised_median: {
    title: "4. Median Non-Linear Filter",
    academicConcept: "Order-Statistic Filtering",
    description: "5x5 non-linear median filter eliminating salt-and-pepper noise while preserving edge boundaries."
  },
  step_5_hsv_colorspace: {
    title: "5. HSV Transformation",
    academicConcept: "Non-Linear Color Space Mapping",
    description: "Decouples chromaticity (Hue/Saturation) from illumination intensity (Value) for robust lighting invariance."
  },
  step_6_clahe_contrast: {
    title: "6. CLAHE Enhancement",
    academicConcept: "Adaptive Histogram Equalization",
    description: "Contrast Limited Adaptive Histogram Equalization applied to CIE-LAB L-channel to highlight subtle surface textures."
  },
  step_7_otsu_threshold: {
    title: "7. Otsu Binarization",
    academicConcept: "Optimum Global Thresholding",
    description: "Minimizes intra-class variance between foreground produce and background substrate."
  },
  step_8_morphology_clean: {
    title: "8. Morphological Operations",
    academicConcept: "Mathematical Morphology",
    description: "Successive Opening (erosion + dilation) to remove false specular artifacts followed by Closing to seal holes."
  },
  step_9_canny_edges: {
    title: "9. Canny Edge Detection",
    academicConcept: "Multi-Stage Gradient Operator",
    description: "Gaussian smoothing, Sobel gradient computation, non-maximum suppression, and hysteresis thresholding."
  },
  step_10_contours: {
    title: "10. Contour Analysis",
    academicConcept: "Topological Shape & Boundary Extraction",
    description: "Suzuki border following algorithm computing bounding rectangles, perimeter, area, and circularity."
  },
  step_11_segmented_foreground: {
    title: "11. Binary Foreground Mask",
    academicConcept: "Region-Based Masked Segmentation",
    description: "Bitwise AND conjunction isolating the segmented produce region from background distractions."
  }
};

export default function ImageProcessingVisualizer({ visualSteps, techniques }: ImageProcessingVisualizerProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedModalImage, setSelectedModalImage] = useState<{ title: string; url: string; concept: string; desc: string } | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedModalImage(null);
      }
    };
    if (selectedModalImage) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedModalImage]);

  const stepKeys = Object.keys(visualSteps).filter(k => visualSteps[k]);

  if (stepKeys.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      {/* Header Accordion Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Image Processing Pipeline Demonstration
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                11 Classical Stages
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic OpenCV algorithms (Denoising, CLAHE, HSV, Otsu, Morphology, Canny & Contours)
            </p>
          </div>
        </div>
        <div className="text-slate-400 group-hover:text-slate-600">
          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expandable Visual Cards */}
      {isOpen && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {stepKeys.map((key) => {
              const meta = STEP_DESCRIPTIONS[key] || {
                title: key.replace(/_/g, ' ').toUpperCase(),
                academicConcept: "Image Processing Transformation",
                description: "Deterministic spatial/color-domain pixel transformation."
              };
              const imgUrl = visualSteps[key]!;

              return (
                <div
                  key={key}
                  onClick={() => setSelectedModalImage({ title: meta.title, url: imgUrl, concept: meta.academicConcept, desc: meta.description })}
                  className="group relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-square w-full bg-slate-900 flex items-center justify-center overflow-hidden relative">
                    <img
                      src={imgUrl}
                      alt={meta.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-medium">
                      <Eye className="w-4 h-4" />
                      <span>Inspect Stage</span>
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{meta.title}</h4>
                      <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mt-0.5">
                        {meta.academicConcept}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {meta.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Applied Methods Badge Strip */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60">
            <h5 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              Verified Image Processing Operations Applied:
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {techniques.map((tech, i) => (
                <span key={i} className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal for Deep Stage Inspection */}
      {selectedModalImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedModalImage(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 id="modal-title" className="text-base font-bold text-slate-800">{selectedModalImage.title}</h3>
                <p className="text-xs font-semibold text-emerald-600">{selectedModalImage.concept}</p>
              </div>
              <button
                onClick={() => setSelectedModalImage(null)}
                aria-label="Close modal"
                className="text-slate-400 hover:text-slate-600 text-sm font-bold px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
              >
                ✕ Close
              </button>
            </div>
            <div className="bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center max-h-[400px]">
              <img src={selectedModalImage.url} alt={selectedModalImage.title} className="max-h-[380px] w-auto object-contain" />
            </div>
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-slate-700 leading-relaxed">
              <strong className="text-emerald-800">Academic Explanation: </strong>
              {selectedModalImage.desc}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
