/**
 * Client-side static image loader using Vite glob imports.
 * Automatically groups images into categories based on subfolder structure in /images.
 */

export function loadGalleryCategories() {
  const modules = import.meta.glob('../../images/**/*.{jpg,jpeg,png,webp,avif,svg,AVIF,JPG,PNG,WEBP}', {
    eager: true,
    import: 'default'
  });

  const categoriesMap = new Map();

  for (const pathKey in modules) {
    const url = modules[pathKey];
    // Example pathKey: "../../images/Lamparas/0116781fbe43eec1f9a536f7b213d92a.jpg"
    const relativePath = pathKey.split('/images/')[1];
    if (!relativePath) continue;

    const parts = relativePath.split('/');
    let category = 'General';
    let filename = parts[parts.length - 1];

    if (parts.length > 1) {
      category = parts[0];
      filename = parts.slice(1).join('/');
    }

    const id = `${category}/${filename}`;

    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, []);
    }

    categoriesMap.get(category).push({
      id,
      filename,
      category,
      url
    });
  }

  const result = [];
  for (const [name, images] of categoriesMap.entries()) {
    result.push({
      name,
      images
    });
  }

  return result;
}
