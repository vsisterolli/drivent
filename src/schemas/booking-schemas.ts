import Joi from "joi";

export const bookingReqSchema = Joi.object({
    roomId: Joi.number().required()
});