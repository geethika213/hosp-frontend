const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Appointment = require('../models/Appointment');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthcare-assistant');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Sample patients
    const patients = [
      {
        email: 'patient1@demo.com',
        password: 'demo123',
        firstName: 'John',
        lastName: 'Smith',
        role: 'patient',
        phone: '+1-555-0101',
        dateOfBirth: new Date('1990-05-15'),
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        emergencyContact: {
          name: 'Jane Smith',
          phone: '+1-555-0102',
          relationship: 'Spouse'
        },
        allergies: ['Penicillin', 'Peanuts'],
        medicalHistory: [
          {
            condition: 'Hypertension',
            diagnosedDate: new Date('2020-01-15'),
            status: 'active'
          }
        ],
        isVerified: true
      },
      {
        email: 'patient2@demo.com',
        password: 'demo123',
        firstName: 'Sarah',
        lastName: 'Wilson',
        role: 'patient',
        phone: '+1-555-0201',
        dateOfBirth: new Date('1985-08-22'),
        address: {
          street: '456 Oak Ave',
          city: 'Brooklyn',
          state: 'NY',
          zipCode: '11201',
          country: 'USA'
        },
        allergies: ['Shellfish'],
        isVerified: true
      },
      {
        email: 'patient3@demo.com',
        password: 'demo123',
        firstName: 'Michael',
        lastName: 'Chen',
        role: 'patient',
        phone: '+1-555-0301',
        dateOfBirth: new Date('1992-12-10'),
        address: {
          street: '789 Pine St',
          city: 'Queens',
          state: 'NY',
          zipCode: '11375',
          country: 'USA'
        },
        isVerified: true
      }
    ];

    // Sample doctors
    const doctors = [
      {
        email: 'dr.johnson@demo.com',
        password: 'demo123',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'doctor',
        phone: '+1-555-1001',
        specialization: 'Cardiology',
        licenseNumber: 'MD12345',
        experience: 15,
        education: [
          {
            degree: 'MD',
            institution: 'Harvard Medical School',
            year: 2008
          },
          {
            degree: 'Residency in Cardiology',
            institution: 'Johns Hopkins Hospital',
            year: 2012
          }
        ],
        certifications: ['Board Certified Cardiologist', 'ACLS Certified'],
        currentHospital: 'City General Hospital',
        currentCity: 'New York',
        isOnline: true,
        consultationFee: 200,
        availableSlots: [
          { day: 'monday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
          { day: 'tuesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
          { day: 'wednesday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
          { day: 'thursday', startTime: '09:00 AM', endTime: '05:00 PM', isAvailable: true },
          { day: 'friday', startTime: '09:00 AM', endTime: '03:00 PM', isAvailable: true }
        ],
        rating: { average: 4.8, count: 127 },
        isVerified: true
      },
      {
        email: 'dr.martinez@demo.com',
        password: 'demo123',
        firstName: 'Carlos',
        lastName: 'Martinez',
        role: 'doctor',
        phone: '+1-555-1002',
        specialization: 'Internal Medicine',
        licenseNumber: 'MD12346',
        experience: 12,
        education: [
          {
            degree: 'MD',
            institution: 'Columbia University',
            year: 2011
          }
        ],
        certifications: ['Board Certified Internal Medicine'],
        currentHospital: 'Metropolitan Medical Center',
        currentCity: 'New York',
        isOnline: true,
        consultationFee: 150,
        rating: { average: 4.6, count: 89 },
        isVerified: true
      },
      {
        email: 'dr.patel@demo.com',
        password: 'demo123',
        firstName: 'Priya',
        lastName: 'Patel',
        role: 'doctor',
        phone: '+1-555-1003',
        specialization: 'Dermatology',
        licenseNumber: 'MD12347',
        experience: 8,
        education: [
          {
            degree: 'MD',
            institution: 'NYU School of Medicine',
            year: 2015
          }
        ],
        certifications: ['Board Certified Dermatologist'],
        currentHospital: 'Brooklyn Medical Center',
        currentCity: 'Brooklyn',
        isOnline: false,
        consultationFee: 180,
        rating: { average: 4.9, count: 156 },
        isVerified: true
      },
      {
        email: 'dr.brown@demo.com',
        password: 'demo123',
        firstName: 'David',
        lastName: 'Brown',
        role: 'doctor',
        phone: '+1-555-1004',
        specialization: 'Neurology',
        licenseNumber: 'MD12348',
        experience: 20,
        education: [
          {
            degree: 'MD',
            institution: 'Yale School of Medicine',
            year: 2003
          }
        ],
        certifications: ['Board Certified Neurologist'],
        currentHospital: 'University Hospital',
        currentCity: 'Manhattan',
        isOnline: true,
        consultationFee: 250,
        rating: { average: 4.7, count: 203 },
        isVerified: true
      }
    ];

    // Admin user
    const admin = {
      email: 'admin@demo.com',
      password: 'demo123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '+1-555-9999',
      isVerified: true
    };

    // Create users
    const allUsers = [...patients, ...doctors, admin];
    const createdUsers = await User.create(allUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    return createdUsers;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
};

const seedAppointments = async (users) => {
  try {
    // Clear existing appointments
    await Appointment.deleteMany({});
    console.log('🗑️ Cleared existing appointments');

    const patients = users.filter(user => user.role === 'patient');
    const doctors = users.filter(user => user.role === 'doctor');

    const appointments = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        appointmentTime: { start: '09:00 AM', end: '09:30 AM' },
        type: 'consultation',
        mode: 'in-person',
        status: 'confirmed',
        priority: 'medium',
        symptoms: ['chest pain', 'shortness of breath'],
        chiefComplaint: 'Experiencing chest discomfort during exercise',
        additionalNotes: 'Patient reports symptoms started last week',
        consultationFee: 200
      },
      {
        patient: patients[1]._id,
        doctor: doctors[1]._id,
        appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
        appointmentTime: { start: '10:30 AM', end: '11:00 AM' },
        type: 'routine-checkup',
        mode: 'telemedicine',
        status: 'scheduled',
        priority: 'low',
        symptoms: [],
        chiefComplaint: 'Annual physical examination',
        consultationFee: 150
      },
      {
        patient: patients[2]._id,
        doctor: doctors[2]._id,
        appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last week
        appointmentTime: { start: '02:00 PM', end: '02:30 PM' },
        type: 'consultation',
        mode: 'in-person',
        status: 'completed',
        priority: 'medium',
        symptoms: ['skin rash', 'itching'],
        chiefComplaint: 'Persistent rash on arms and legs',
        diagnosis: 'Contact dermatitis',
        treatmentPlan: 'Topical corticosteroid cream, avoid allergens',
        prescriptions: [
          {
            medication: 'Hydrocortisone cream 1%',
            dosage: 'Apply thin layer',
            frequency: 'Twice daily',
            duration: '7 days',
            instructions: 'Apply to affected areas only'
          }
        ],
        patientRating: {
          rating: 5,
          feedback: 'Excellent care, very thorough examination',
          ratedAt: new Date()
        },
        consultationFee: 180
      },
      {
        patient: patients[0]._id,
        doctor: doctors[3]._id,
        appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        appointmentTime: { start: '11:00 AM', end: '11:30 AM' },
        type: 'follow-up',
        mode: 'telemedicine',
        status: 'confirmed',
        priority: 'medium',
        symptoms: ['headache', 'dizziness'],
        chiefComplaint: 'Follow-up for recurring headaches',
        consultationFee: 250
      }
    ];

    const createdAppointments = await Appointment.create(appointments);
    console.log(`✅ Created ${createdAppointments.length} appointments`);

    return createdAppointments;
  } catch (error) {
    console.error('❌ Error seeding appointments:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Starting database seeding...');
    
    const users = await seedUsers();
    await seedAppointments(users);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('Patient: patient1@demo.com / demo123');
    console.log('Doctor: dr.johnson@demo.com / demo123');
    console.log('Admin: admin@demo.com / demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, seedUsers, seedAppointments };
