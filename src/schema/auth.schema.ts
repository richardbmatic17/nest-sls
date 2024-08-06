import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ type: String, required: true })
  username: string;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String })
  age: string;

  @Prop({ type: String })
  address: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
