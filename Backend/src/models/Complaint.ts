import { Schema, model } from 'mongoose';

interface IComplaint {
  user: any;
  messages: Array<{ from: string; text?: string; image?: string; createdAt: Date }>;
  status: string;
}

const complaintSchema = new Schema<IComplaint>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{ from: String, text: String, image: String, createdAt: { type: Date, default: Date.now } }],
  status: { type: String, default: 'open' }
}, { timestamps: true });

export default model<IComplaint>('Complaint', complaintSchema);
