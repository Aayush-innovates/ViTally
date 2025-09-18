# 🩸 ViTally : Real-Time SOS Blood Donation Platform

🚑 **Connecting Patients with Life-Saving Donors - Instantly, Intelligently, and Reliably.**

Try our project live : **https://vitally-frontend.onrender.com**

---

## 📌 Overview  

In emergencies, **time = life**.  
Our platform bridges the gap between patients in urgent need of blood and nearby compatible donors using **AI-powered donor matching**, **Aadhar Verification**.

This project was built during a **24-hour hackathon**, designed to be lightweight, scalable, and impactful.  
**NOTE : The SMS Blood Request messaging flow is yet to implement and is in development.**

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

4. **Donor Alerts (NOTE: Not implemented yet)**  
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
- 📊 **Hospital Dashboard** - Send blood requests via a form and see nearby donors.  
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
