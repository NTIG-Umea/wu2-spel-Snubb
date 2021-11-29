module.exports = (eleventyConfig) => {
    
    // ladda om när assets ändras
    // önskvärt kan vara en watch på js mappen
    eleventyConfig.addWatchTarget("./src/assets");
    eleventyConfig.addPassthroughCopy('src/assets');
    
    return {
        dir: {
            input: 'src',
            output: 'dist'
        }
    };
};
