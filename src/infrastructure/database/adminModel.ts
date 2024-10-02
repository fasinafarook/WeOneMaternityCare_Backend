import mongoose, {Schema, Model} from 'mongoose';
import Admin from '../../domain/entities/admin';

const adminSchema: Schema<Admin> = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },

})


const adminModel: Model<Admin> = mongoose.model<Admin>("admin", adminSchema)
export {adminModel}