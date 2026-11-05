import { z } from 'zod';

export const SettingKeySchema = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9._-]+$/, 'Invalid setting key');

export const SettingValueSchema = z.union([
  z.string().max(1_000_000),
  z.number(),
  z.boolean(),
  z.null(),
  z.record(z.unknown()),
  z.array(z.unknown()),
]);

export const ProfileCreateSchema = z.object({
  id: z.string().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/),
  name: z.string().min(1).max(64).trim(),
  theme_id: z.string().max(64).optional(),
  wallpaper_id: z.string().max(64).nullable().optional(),
  layout_id: z.string().max(64).nullable().optional(),
});

export const ProfileUpdateSchema = z.object({
  name: z.string().min(1).max(64).trim().optional(),
  theme_id: z.string().max(64).nullable().optional(),
  wallpaper_id: z.string().max(64).nullable().optional(),
  layout_id: z.string().max(64).nullable().optional(),
});

export const IdSchema = z.string().min(1).max(64);

export const WallpaperAddSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(256),
  path: z.string().min(1).max(1024),
  category: z.string().max(64).optional(),
});

export const LayoutSaveSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
  config: z.string().min(2).max(5_000_000),
  is_preset: z.number().int().min(0).max(1).optional(),
});

export const WorkspaceSaveSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(128),
  profile_id: z.string().max(64).nullable().optional(),
  config: z.string().min(2).max(5_000_000),
});

export const WallpaperPathSchema = z
  .string()
  .min(1)
  .max(1024)
  .refine((p) => !/[`$|"']/.test(p), 'Unsafe path characters')
  .refine((p) => /\.(jpg|jpeg|png|bmp)$/i.test(p), 'Unsupported image type');

export const AppPathSchema = z.string().min(1).max(512);

export const UrlSchema = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), 'Only http(s) allowed');

export const AutostartSchema = z.boolean();

export const ProfileExportSchema = z.object({
  formatVersion: z.literal(1),
  application: z.literal('FORMA'),
  profile: z.object({
    name: z.string().min(1),
    theme: z.string(),
    wallpaper: z.string().optional(),
    workspace: z.string().optional(),
    widgets: z.array(z.unknown()).optional(),
    layout: z
      .object({
        type: z.string(),
        elements: z.array(z.unknown()).optional(),
      })
      .optional(),
  }),
});

export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown, label = 'input'): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new Error(`Validation failed (${label}): ${msg}`);
  }
  return result.data;
}
