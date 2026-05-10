const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/hospital_ms';

const userSchema = new mongoose.Schema({ name: String, email: { type: String, unique: true }, password: String, role: String });
const doctorSchema = new mongoose.Schema({ doctorId: { type: String, unique: true }, name: String, specialization: String, qualification: String, experience: Number, phone: String, email: String, department: String, status: String, fee: Number });
const patientSchema = new mongoose.Schema({ patientId: { type: String, unique: true }, name: String, age: Number, gender: String, phone: String, email: String, bloodGroup: String, status: String, admittedDate: Date, address: String });

const User = mongoose.model('User', userSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);
const Patient = mongoose.model('Patient', patientSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing
  await Promise.all([User.deleteMany(), Doctor.deleteMany(), Patient.deleteMany()]);

  // Admin user
  const password = await bcrypt.hash('admin123', 10);
  await User.create({ name: 'Admin User', email: 'admin@medicore.com', password, role: 'admin' });
  console.log('✅ Admin created: admin@medicore.com / admin123');

  // Doctors
  const doctors = [
    { doctorId: 'DOC0001', name: 'Rajesh Kumar', specialization: 'Cardiologist', qualification: 'MBBS, MD Cardiology', experience: 15, phone: '9876543210', email: 'rajesh@medicore.com', department: 'Cardiology', status: 'Active', fee: 800 },
    { doctorId: 'DOC0002', name: 'Priya Sharma', specialization: 'Neurologist', qualification: 'MBBS, DM Neurology', experience: 10, phone: '9876543211', email: 'priya@medicore.com', department: 'Neurology', status: 'Active', fee: 1000 },
    { doctorId: 'DOC0003', name: 'Anil Mehta', specialization: 'Orthopedic Surgeon', qualification: 'MBBS, MS Orthopedics', experience: 12, phone: '9876543212', email: 'anil@medicore.com', department: 'Orthopedics', status: 'Active', fee: 700 },
    { doctorId: 'DOC0004', name: 'Sunita Patel', specialization: 'Pediatrician', qualification: 'MBBS, MD Pediatrics', experience: 8, phone: '9876543213', email: 'sunita@medicore.com', department: 'Pediatrics', status: 'Active', fee: 500 },
    { doctorId: 'DOC0005', name: 'Vikram Singh', specialization: 'General Physician', qualification: 'MBBS', experience: 6, phone: '9876543214', email: 'vikram@medicore.com', department: 'General Medicine', status: 'On Leave', fee: 400 },
  ];
  await Doctor.insertMany(doctors);
  console.log(`✅ ${doctors.length} doctors added`);

  // Patients
  const patients = [
    { patientId: 'PAT00001', name: 'Mohan Das', age: 45, gender: 'Male', phone: '9898989898', email: 'mohan@gmail.com', bloodGroup: 'B+', status: 'Active', address: 'Surat, Gujarat', admittedDate: new Date() },
    { patientId: 'PAT00002', name: 'Kavita Joshi', age: 32, gender: 'Female', phone: '9797979797', email: 'kavita@gmail.com', bloodGroup: 'A+', status: 'Active', address: 'Ahmedabad, Gujarat', admittedDate: new Date() },
    { patientId: 'PAT00003', name: 'Ramu Lal', age: 60, gender: 'Male', phone: '9696969696', bloodGroup: 'O+', status: 'Critical', address: 'Baroda, Gujarat', admittedDate: new Date() },
    { patientId: 'PAT00004', name: 'Anita Rao', age: 28, gender: 'Female', phone: '9595959595', bloodGroup: 'AB-', status: 'Discharged', address: 'Mumbai, Maharashtra', admittedDate: new Date(Date.now() - 7 * 86400000) },
    { patientId: 'PAT00005', name: 'Suresh Verma', age: 52, gender: 'Male', phone: '9494949494', bloodGroup: 'A-', status: 'Active', address: 'Rajkot, Gujarat', admittedDate: new Date() },
  ];
  await Patient.insertMany(patients);
  console.log(`✅ ${patients.length} patients added`);

  console.log('\n🎉 Database seeded! You can login with admin@medicore.com / admin123');
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
