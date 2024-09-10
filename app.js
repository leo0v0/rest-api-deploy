const express = require("express")
const crypto = require("node:crypto")
const movies = require ("./movies.json")
const cors = require("cors")
const { validateMovie, validatePartialMovies } = require("./schemas/movies")
const app = express()

app.disable("x-powered-by")
app.use(express.json())
app.use(cors({
    origin : (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            "http://localhost:8080",
            "http://localhost:3000",
            "http://movies.com",
            "http://midu.dev"
        ]
    }
})) //Utilizando IF en las methods para poder cambiar los access para que no aparezca solo el *




app.get("/", (req, res)=>{
    res.json({message: "Hola mundo"})
})

//Todos los recursos que sean MOVIES se identifican con /movies
app.get("/movies",(req,res)=>{
    // const origin = req.header("origin")
    // if(ACCEPTED_ORIGINS.includes(origin)){
    // res.header("Access-Control-Allow-Origin", "http://localhost:8080")
    // }
    const { genre } = req.query
    if(genre){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())     /// Para poder escribir el genero ya sea mayuscula o minuscula
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.post("/movies",(req,res)=>{

    const result = validateMovie(req.body)

    if(result.error){
        return res.status(400).json({error: JSON.parse(result.error.message)})
    }

    const newMovie = {
        id: crypto.randomUUID(), //uuid v4
        ...result.data
    }
    //Esto no es REST
    movies.push(newMovie)

    res.status(201).json(newMovie) // Actualizar el cache del cliente
})

app.delete("/movies/:id", (req, res)=>{
    // const origin = req.header("origin")
    // if(ACCEPTED_ORIGINS.includes(origin) || !origin){
    // res.header("Access-Control-Allow-Origin", origin)
    // }


    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    
    if(movieIndex === -1){
        return res.status(404).json({message: "Movie not found"})
    }
    movies.splice(movieIndex, 1)
    return res.json({message : "Movie deleted"})
})

app.patch("/movies/:id",(req,res)=>{
    const result = validatePartialMovies(req.body)
    if(!result.success){
        return res.status(400).json({error : JSON.parse(result.error.message)})
    }

    const {id} = req.params
    const movieIndex = movies.find(movie => movie.id === id)

    if(movieIndex === -1){
         return res.status(404).json({message: "Movie not found"})
        }

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }
    movies[movieIndex] = updateMovie

    return res.json(updateMovie)

    })


//Filtrar por id
app.get("/movies/:id",(req,res)=>{
    const {id} = req.params
    const movie = movies.find(movie => movie.id === id)
    if(movie) return res.json(movie)
    
    res.status(404).json({ message: "Movies not found"})        
})

// app.options ("/movies/:id", (req,res)=>{
//     const origin = req.header("origin")
//     if(ACCEPTED_ORIGINS.includes(origin) || !origin){
//     res.header("Access-Control-Allow-Origin", origin)
//     res.header("Access-Control-Allow-Methods", "GET, PATH, PUT, PATCH, DELETE")
//     }
//     res.send(200)
// })

const PORT = process.env.PORT ?? 3000

app.listen (PORT, ()=>{
    console.log(`server listening on port:  http://localhost:${PORT}` )
})