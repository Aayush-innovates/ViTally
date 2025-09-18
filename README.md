# 🩸 ViTally : Real-Time SOS Blood Donation Platform

🚑 **Connecting Patients with Life-Saving Donors - Instantly, Intelligently, and Reliably.**

---

## 📌 Overview  

In emergencies, **time = life**.  
Our platform bridges the gap between patients in urgent need of blood and nearby compatible donors using **AI-powered donor matching**, **real-time alerts**, and a **frictionless confirmation flow**.  

This project was built during a **24-hour hackathon**, designed to be lightweight, scalable, and impactful.  

---

## 🔑 Core Flow  

1. **JWT Authentication & Aadhar-based age verification**
   - User signs up as donor/hospital(doctor) filling up a form
   - If sign up as donor, user needs to verify his age to ensure he/she's an adult:
       - Uploads his aadhar as an image in .png/.jpg/.jpeg format (does not store personal details)
       - API verifies age and donor is signed up
    
2. **Hospital Request**  
   - Hospital/Doctor fills a request form with patient details:  
     - Blood group  
     - Location (lat/lng)  
     - Urgency level & units needed  

3. **Rule-Based AI**  
   - Our model matches the patient with the most suitable donors within a set radius (e.g., 10km).  
   - Criteria:  
     - Blood group compatibility  
     - Past donation history  
     - Proximity to hospital/patient  
     - Health eligibility  

4. **Donor Alerts**  
   - Shortlisted donors instantly receive an **SMS notification**.  
   - Donors confirm availability via a simple link → “Do you accept this request?”  

5. **Hospital Dashboard**  
   - Displays confirmed donors with their details & estimated arrival.  
   - Updates in **real time** as new donors confirm.  
   - Request is marked *fulfilled* once donation is complete.  

---

## ⚡ Features  

- 🏥 **Hospital Request Form** - Raise urgent requests with ease.
- 🔐 **Aadhar-based Age Verification** - Upload Aadhar Image and verify your age.
- 🤖 **Rule-Based AI** - Fast, intelligent donor-patient matching.
- 📍 **Radius-Based Shortlisting** - Alerts only nearby, eligible donors.  
- 📲 **Frictionless Donor Flow** - No app needed; SMS with secure link.  
- 📊 **Hospital Dashboard** - Track donor confirmations live.  
- 🔔 **Short-Message Alerts** - SMS Notifications.  
- 🌟 **Smart Prioritization** - AI ranks donors by distance, eligibility, and reliability.  

---

## 🖥️ Tech Stack  

- **Frontend:** React.js  
- **Backend:** Node.js + Express  
- **Database:** MongoDB
- **Aadhar Parser:** Spring Boot
- **Automation:** Python (Pandas, Flask, PyMongo)
- **API Testing:** Postman  
- **SMS/Alerts:** Twilio
- **Deployment:** Render(frontend/backend + apis)
---

## 🚀 Getting Started  

1. **Clone this repo**  
   ```bash
   git clone https://github.com/Aayush-innovates/ViTally.git
   cd ViTally


👥 Team
- Aayush Sadaye - [GitHub](https://github.com/Aayush-innovates)
- Prayag Upadhyaya - [GitHub](https://github.com/prayagupa23)
- Parth Salunke - [GitHub](https://github.com/sparth292)
- Jagruti Borhade - [GitHub](https://github.com/)
