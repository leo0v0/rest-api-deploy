const z = require("zod");

const movieSchema = z.object({
    title: z.string({
        required_error: "Movie title is required"
    }),
    year: z.number().int().min(1900).max(2024),
    director: z.string(),
    duration: z.number().int().positive(),
    rate: z.number().min(0).max(10).default(5),
    poster: z.string().url({
        message: "Poster must be a valid URL"
    }),
    genre: z.enum(["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Thriller", "Sci-Fi", "Crime"]).array()
});

function validateMovie(object) {
    return movieSchema.safeParse(object);
}

function validatePartialMovies(object){
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovies
};
