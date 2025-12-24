const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Validate required environment variables
if (!CLOUD_NAME) {
    console.warn('Missing required environment variable: VITE_CLOUDINARY_CLOUD_NAME. Cloudinary features will not work.');
}
if (!UPLOAD_PRESET) {
    console.warn('Missing required environment variable: VITE_CLOUDINARY_UPLOAD_PRESET. Cloudinary features will not work.');
}

export const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    // Use 'auto' resource type - Cloudinary will detect the file type
    // This works with unsigned presets for all file types (images, videos, PDFs, etc.)
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Cloudinary upload error:', errorData);
        throw new Error(errorData.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return {
        url: data.secure_url, // Use HTTPS URL
        name: data.original_filename,
        format: data.format,
        size: data.bytes,
        resourceType: data.resource_type // Store the detected resource type
    };
};

export const getPreviewUrl = (publicId) => {
    // Basic optimization and delivery
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${publicId}`;
}
