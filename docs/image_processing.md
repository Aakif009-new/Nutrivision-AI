# Image Processing Module — Academic Documentation

This module contains **zero neural network predictions**. Every transformation is a deterministic mathematical operator executed using OpenCV.

---

## 1. Techniques & Mathematical Formulation

### 1.1 Digital Image Acquisition & Sampling
- **Function**: `cv2.resize(img, (640, 640), interpolation=cv2.INTER_AREA)`
- **Concept**: Area interpolation avoids moiré patterns and downsampling aliasing artifacts.

### 1.2 Gaussian Smoothing (Low-Pass Filter)
- **Function**: `cv2.GaussianBlur(img, (5, 5), sigmaX=1.2)`
- **Equation**:
  $$G(x, y) = \frac{1}{2\pi\sigma^2} e^{-\frac{x^2+y^2}{2\sigma^2}}$$
- **Purpose**: Attenuates high-frequency electronic sensor noise.

### 1.3 Median Non-Linear Filtering
- **Function**: `cv2.medianBlur(img, 5)`
- **Concept**: Rank-order statistic filter that replaces central pixel with the median of its $5 \times 5$ neighborhood, eliminating impulse / salt-and-pepper noise while preserving hard edge boundaries.

### 1.4 Color Space Transformations (HSV & CIE-LAB)
- **Functions**: `cv2.cvtColor(img, cv2.COLOR_BGR2HSV)` and `cv2.cvtColor(img, cv2.COLOR_BGR2LAB)`
- **Concept**:
  - **HSV**: Decouples chromaticity (Hue $[0, 180]$ and Saturation $[0, 255]$) from illuminance (Value $[0, 255]$) for lighting-invariant segmentation.
  - **CIE-LAB**: Perceptually uniform color space where $L^*$ represents lightness.

### 1.5 CLAHE (Contrast-Limited Adaptive Histogram Equalization)
- **Function**: `cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))` applied on $L^*$ channel.
- **Concept**: Enhances localized surface textures without over-amplifying background noise by clipping histogram slope.

### 1.6 Otsu Global Optimal Binarization
- **Function**: `cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)`
- **Concept**: Maximizes inter-class variance $\sigma_B^2(t) = \omega_0(t)\omega_1(t)[\mu_0(t) - \mu_1(t)]^2$ to find optimal separation threshold between foreground food and substrate.

### 1.7 Mathematical Morphology
- **Functions**:
  - `Opening`: $\text{img} \circ K = (\text{img} \ominus K) \oplus K$ (Erosion followed by Dilation) to remove small noise specs.
  - `Closing`: $\text{img} \bullet K = (\text{img} \oplus K) \ominus K$ (Dilation followed by Erosion) to bridge internal gaps and cavities.
- **Structuring Element**: Elliptical kernel $7 \times 7$.

### 1.8 Canny Edge Detection
- **Function**: `cv2.Canny(gray, 50, 150)`
- **Pipeline**:
  1. Gaussian filter smoothing.
  2. Sobel horizontal $G_x$ and vertical $G_y$ gradient calculation: $|G| = \sqrt{G_x^2 + G_y^2}$.
  3. Non-maximum suppression along gradient angle $\theta = \arctan(G_y / G_x)$.
  4. Hysteresis thresholding ($T_{\text{low}}=50, T_{\text{high}}=150$).

### 1.9 Topological Contour & Shape Analysis
- **Functions**: `cv2.findContours(..., cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)`
- **Computed Metrics**:
  - Area $A = \text{cv2.contourArea}(C)$
  - Perimeter $P = \text{cv2.arcLength}(C, \text{True})$
  - Circularity / Isoperimetric Quotient $Q = \frac{4\pi A}{P^2}$
  - Aspect Ratio $AR = \frac{\text{width}}{\text{height}}$

### 1.10 ArUco Marker Metric Calibration
- **Function**: `cv2.aruco.detectMarkers(...)`
- **Equation**:
  $$\text{Scale (pixels/cm)} = \frac{\text{Marker Width in Pixels}}{\text{Known Marker Width in cm}}$$
  $$\text{Real Size (cm)} = \frac{\text{Object Bounding Box (Pixels)}}{\text{Scale (pixels/cm)}}$$
