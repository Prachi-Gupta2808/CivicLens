# 🏙️ CivicLens
 
> **See the problem. Report it. Watch it get fixed.**
> A civic-tech platform for reporting and resolving public infrastructure issues across India.
 
---
 
## 📌 Overview
 
**CivicLens** is a full-stack Progressive Web App (PWA) that empowers citizens to report public infrastructure issues — potholes, broken drains, garbage dumps, damaged streetlights, and more — while enabling government fixer teams to prioritize, assign, and resolve them through a real-time accountability loop.
 
Built on the **MERN stack**, CivicLens bridges the gap between citizens and civic authorities by combining community reporting, machine learning-assisted validation, GPS-based deduplication, and a transparent resolution pipeline.
 
---
 
## ✨ Key Features
 
### 👤 Citizen-Facing (PWA)
- 📸 **Photo-first reporting** — Upload issue photos; BLIP-2 auto-generates editable captions
- 🤖 **ML Relevance Filter** — Only civic-relevant photos pass upload validation
- 📍 **GPS geo-tagging** — Precise location captured at submission
- 🔁 **Raise Count** — If an issue already exists within a 50m radius, your report increments its priority counter instead of creating a duplicate
- ✅ **Accountability Loop** — Issue closure requires an after-photo, verified by ML
 
### 🛠️ Government Fixer Dashboard
- 🗺️ **Dual-layer Heatmap** — Color-coded India map showing:
  - **Layer 1**: Issue density by region
  - **Layer 2**: Resolution performance by ward/district
- 📋 **Issue Queue** — Sorted by raise count, recency, and category
- 📂 **After-photo Verification** — Required to close any issue
 
### 🔒 Trust & Safety
- 🚫 **False Positive Management** — ML filters at upload + community flagging
- ⚠️ **One-Strike Policy** — Users confirmed to post false reports are permanently blocked
- 🔐 **Role-based Access** — Citizen, Fixer, and Admin roles with separate dashboards
 
---
 
## 🛠️ Tech Stack
 
| Layer | Technology |
|---|---|
| Frontend | React.js (PWA) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| ML — Captioning | BLIP-2 (image-to-text) |
| ML — Classifier | Custom relevance classifier (civic vs non-civic) |
| Geo-processing | GPS coordinates + Haversine formula (50m dedup radius) |
| Maps | Leaflet.js / Mapbox |
| Auth | JWT + bcrypt |
| Storage | Cloudinary / AWS S3 (issue photos) |
| Hosting | Vercel (frontend) + Render/Railway (backend) |
 
---
 
## 🧠 ML Components
 
### 1. Image Relevance Classifier
- **Purpose**: Filters out non-civic images (selfies, food photos, memes) at upload time
- **Approach**: Binary classification — `civic` vs `not-civic`
- **Integration**: Called as a pre-upload validation step before any issue is created
 
### 2. BLIP-2 Auto-Captioner
- **Purpose**: Generates a human-readable description of the issue from the uploaded photo
- **Output**: Editable caption pre-filled in the report form (e.g., *"Large pothole on road surface with visible water logging"*)
- **Model**: Salesforce BLIP-2 (via HuggingFace Inference API or self-hosted)
 
### 3. False Positive Detector (Post-submission)
- **Purpose**: Flags suspicious or non-genuine reports for admin review
- **Triggers**: Community flags + ML confidence score below threshold
 
---
 
## 📐 Geo-Deduplication Logic
 
```
For every new issue submission:
  1. Extract GPS coordinates (lat, lng)
  2. Query all open issues within 50m radius (Haversine)
  3. If match found:
       → Increment raise_count on existing issue
       → Return "Issue already reported" to user
  4. If no match:
       → Create new issue document in DB
```
 
This prevents duplicate entries while surfacing high-priority spots through crowd-validation.
 
---
