const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: [true, 'Role is required']
  },
  phone: {
    type: String,
    match: [/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number']
  },
  avatar: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  
  // Patient specific fields
  dateOfBirth: {
    type: Date,
    required: function() { return this.role === 'patient'; }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'USA' }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    status: { type: String, enum: ['active', 'resolved', 'chronic'], default: 'active' }
  }],
  allergies: [String],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: Date,
    endDate: Date
  }],
  
  // Doctor specific fields
  specialization: {
    type: String,
    required: function() { return this.role === 'doctor'; }
  },
  licenseNumber: {
    type: String,
    required: function() { return this.role === 'doctor'; },
    unique: true,
    sparse: true
  },
  experience: {
    type: Number,
    min: 0
  },
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  certifications: [String],
  currentHospital: String,
  currentCity: String,
  isOnline: {
    type: Boolean,
    default: false
  },
  consultationFee: {
    type: Number,
    min: 0
  },
  availableSlots: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    startTime: String,
    endTime: String,
    isAvailable: { type: Boolean, default: true }
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  reviews: [{
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    date: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'address.city': 1, specialization: 1 });
userSchema.index({ isOnline: 1, role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (exclude sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.verificationToken;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  return userObject;
};

// Get doctor profile for patient search
userSchema.methods.getDoctorProfile = function() {
  if (this.role !== 'doctor') return null;
  
  return {
    _id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    specialization: this.specialization,
    experience: this.experience,
    currentHospital: this.currentHospital,
    currentCity: this.currentCity,
    isOnline: this.isOnline,
    consultationFee: this.consultationFee,
    rating: this.rating,
    avatar: this.avatar
  };
};

module.exports = mongoose.model('User', userSchema);
