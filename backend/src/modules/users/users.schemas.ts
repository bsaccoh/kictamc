import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    middleName: z.string().optional().nullable(),
    surname: z.string().min(2).optional(),
    dateOfBirth: z.string().datetime().optional().nullable(),
    gender: z.string().optional().nullable(),
    nationality: z.string().optional().nullable(),
    placeOfBirth: z.string().optional().nullable(),
    maritalStatus: z.string().optional().nullable(),
    residentialAddress: z.string().optional().nullable(),
    townCity: z.string().optional().nullable(),
    chiefdom: z.string().optional().nullable(),
    district: z.string().optional().nullable(),
    regionProvince: z.string().optional().nullable(),
    postalAddress: z.string().optional().nullable(),
    passportPhotoUrl: z.string().optional().nullable(),

    // Parent / Guardian
    parentFullName: z.string().optional().nullable(),
    parentRelationship: z.string().optional().nullable(),
    parentPhone: z.string().optional().nullable(),
    parentAltPhone: z.string().optional().nullable(),
    parentAddress: z.string().optional().nullable(),
    parentEmail: z.string().email().optional().nullable().or(z.literal('')),
    parentOccupation: z.string().optional().nullable(),

    // Emergency Contact
    emergencyFullName: z.string().optional().nullable(),
    emergencyRelationship: z.string().optional().nullable(),
    emergencyPhone: z.string().optional().nullable(),
    emergencyAddress: z.string().optional().nullable(),
  }),
});
