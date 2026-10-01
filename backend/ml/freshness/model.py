import torch
import torch.nn as nn

class FreshnessCNN(nn.Module):
    """
    Academic Custom CNN Freshness Classifier.
    Designed and initialized strictly from scratch (Zero Pretrained Weights / No Transfer Learning).
    
    Architecture:
      Input (3, 224, 224)
      -> Block 1: Conv2d(3->32, 3x3) + BatchNorm + ReLU + MaxPool(2x2)  -> (32, 112, 112)
      -> Block 2: Conv2d(32->64, 3x3) + BatchNorm + ReLU + MaxPool(2x2) -> (64, 56, 56)
      -> Block 3: Conv2d(64->128, 3x3) + BatchNorm + ReLU + MaxPool(2x2)-> (128, 28, 28)
      -> Block 4: Conv2d(128->256, 3x3) + BatchNorm + ReLU + AdaptiveAvgPool2d(1x1) -> (256, 1, 1)
      -> Flatten
      -> Linear(256 -> 128) + ReLU + Dropout(0.4)
      -> Linear(128 -> num_classes)
    """

    def __init__(self, num_classes: int = 2):
        super(FreshnessCNN, self).__init__()
        
        self.block1 = nn.Sequential(
            nn.Conv2d(3, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        
        self.block2 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        
        self.block3 = nn.Sequential(
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        
        self.block4 = nn.Sequential(
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.AdaptiveAvgPool2d((1, 1))
        )
        
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(256, 128),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.4),
            nn.Linear(128, num_classes)
        )
        
        # Initialize weights with Kaiming (He) normal initialization from scratch
        self._init_weights()

    def _init_weights(self):
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight, mode='fan_out', nonlinearity='relu')
                if m.bias is not None:
                    nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.BatchNorm2d):
                nn.init.constant_(m.weight, 1)
                nn.init.constant_(m.bias, 0)
            elif isinstance(m, nn.Linear):
                nn.init.normal_(m.weight, 0, 0.01)
                nn.init.constant_(m.bias, 0)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.block1(x)
        x = self.block2(x)
        x = self.block3(x)
        x = self.block4(x)
        logits = self.classifier(x)
        return logits
