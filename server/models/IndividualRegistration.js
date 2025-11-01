import mongoose from 'mongoose';

const IndividualRegistrationSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true },
    grade: { type: Number, required: true },
    category: { type: String },
    style: { type: String },
    schoolName: { type: String, required: true },
    taluk: { type: String, required: true },
    district: { type: String, required: true },
    parentName: { type: String, required: true },
    parentEmail: { type: String, required: true },
    parentPhone: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'registrations_individual' }
);

export const IndividualRegistration = mongoose.model('IndividualRegistration', IndividualRegistrationSchema);
