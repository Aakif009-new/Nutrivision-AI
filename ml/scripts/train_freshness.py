import os
import torch
import torch.nn as nn
import torchvision.models as models


def export_dummy_freshness_onnx(output_path: str = "ml/models/freshness_cnn.onnx"):
    """
    Exports EfficientNet surface spoilage freshness model to ONNX runtime format.
    Classes: [0: Fresh, 1: Moderate, 2: Spoiled]
    """
    print("Building EfficientNet-B0 Freshness Classifier...")
    model = models.efficientnet_b0(weights=models.EfficientNet_B0_Weights.DEFAULT)
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, 3)
    model.eval()

    # Dummy tensor for export verification (1, 3, 224, 224)
    dummy_input = torch.randn(1, 3, 224, 224)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    torch.onnx.export(
        model,
        dummy_input,
        output_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )

    print(f"Freshness ONNX model exported successfully to {output_path}")


if __name__ == "__main__":
    export_dummy_freshness_onnx()
