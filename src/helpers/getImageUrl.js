const getImageUrl = (img) => {
    if (!img) return "";
    if (img.startsWith("blob:")) return img;
    if (import.meta.env.PROD) return img;

    // DEV environment
    if (/^https?:\/\//i.test(img)) return img.replace(/^https?:\/\//i, "//");
    const BASE = "//checkwebsite.co.in/tummly/product_images/";
    return img.startsWith("/") ? BASE + img.slice(1) : BASE + img;
};

export { getImageUrl }