# 🔹 IMPORTS
from fastapi import FastAPI, UploadFile, File
from PIL import Image
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from transformers import BlipProcessor, BlipForConditionalGeneration
import shutil


# 🔹 DEVICE (same logic as notebook)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# 🔹 LOAD BLIP
processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
model_blip = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")


# 🔹 REBUILD MODEL EXACTLY LIKE TRAINING
model = models.resnet18(pretrained=False)

# Freeze all layers
for param in model.parameters():
    param.requires_grad = False

# Unfreeze last block
for param in model.layer4.parameters():
    param.requires_grad = True

# Final layer
model.fc = nn.Linear(model.fc.in_features, 6)

# Load weights
model.load_state_dict(torch.load("road_model.pth", map_location=device))
model = model.to(device)
model.eval()


# 🔹 EXACT CLASS ORDER (CRITICAL)
class_names = ['debris', 'fallen_tree', 'garbage', 'normal', 'pothole', 'waterlogging']


# 🔹 EXACT SAME TRANSFORM AS val_test_transforms
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# 🔹 PREDICTION FUNCTION
def predict_image(image_path):
    image = Image.open(image_path).convert("RGB")
    image = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(image)
        probs = F.softmax(outputs, dim=1)

        # DEBUG (keep for now)
        print("PROBS:", probs.cpu().numpy())

        confidence, pred = torch.max(probs, 1)

    return class_names[pred.item()], confidence.item()


def generate_paragraph_caption(image_path, label):
    image = Image.open(image_path).convert("RGB")

    inputs = processor(
        image,
        text="a detailed description of a road scene showing an issue",
        return_tensors="pt"
    )

    output = model_blip.generate(**inputs, max_length=50)
    caption = processor.decode(output[0], skip_special_tokens=True)

    # Clean grammar
    caption = caption.strip().capitalize()
    if not caption.endswith("."):
        caption += "."

    # Add context line (improves richness)
    context_line = "The issue appears clearly visible in this area and affects the condition of the road surface."

    # Hazards
    hazards = {
        "pothole": "It can lead to vehicle damage, sudden jerks, and increase the risk of accidents for drivers.",
        "garbage": "It can create unhygienic surroundings, attract pests, and degrade environmental conditions.",
        "waterlogging": "It can disrupt traffic flow, hide road damage, and increase the chances of skidding or accidents.",
        "fallen_tree": "It can block the road completely and pose serious danger to both vehicles and pedestrians.",
        "debris": "It can obstruct movement, damage vehicles, and create unsafe driving conditions."
    }

    hazard_text = hazards.get(label, "It may pose safety risks to the public.")

    # FINAL PARAGRAPH (clean + strong)
    paragraph = (
        f"A {label} is observed on the road in this area. "
        f"{caption} "
        f"{context_line} "
        f"{hazard_text}"
    )

    return paragraph
    image = Image.open(image_path).convert("RGB")

    inputs = processor(
        image,
        text="a road scene with damage",
        return_tensors="pt"
    )

    output = model_blip.generate(**inputs)
    caption = processor.decode(output[0], skip_special_tokens=True)

    caption = caption.strip().capitalize()
    if not caption.endswith("."):
        caption += "."

    hazards = {
        "pothole": "This could damage vehicles and cause loss of control.",
        "garbage": "This may create unhygienic conditions and attract pests.",
        "waterlogging": "This may lead to traffic disruption and accidents.",
        "fallen_tree": "This can block the road and cause serious accidents.",
        "debris": "This may obstruct traffic and damage vehicles."
    }

    paragraph = f"The image shows a {label} on the road. {caption} {hazards.get(label, '')}"

    return paragraph


# 🔹 FASTAPI
app = FastAPI()


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_path = "temp.jpg"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    label, confidence = predict_image(file_path)

    if label == "normal" or confidence < 0.8:
        return {
            "label": label,
            "confidence": confidence,
            "description": "Not a reportable issue"
        }

    description = generate_paragraph_caption(file_path, label)

    return {
        "label": label,
        "confidence": confidence,
        "description": description
    }