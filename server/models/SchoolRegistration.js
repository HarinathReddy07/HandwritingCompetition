import mongoose from 'mongoose';

const SchoolRegistrationSchema = new mongoose.Schema(
  {
    orgName: { type: String, required: true },
    coordName: { type: String, required: true },
    coordEmail: { type: String, required: true },
    coordPhone: { type: String, required: true },
    taluk: { type: String, required: true },
    district: { type: String, required: true },
    fileName: { type: String },
    filePath: { type: String },
    downloadURL: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'registrations_school' }
);

export const SchoolRegistration = mongoose.model('SchoolRegistration', SchoolRegistrationSchema);
