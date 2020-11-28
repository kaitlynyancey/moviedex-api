require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')

const moviedex = require('./movies-data-small.json')

const app = express()

app.use(morgan('dev'))
app.use(helmet())
app.use(cors())

app.use(function validateBearerToken(req, res, next) {
    const authToken = req.get('Authorization')
    const apiToken = process.env.API_TOKEN
    
    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }
    
    next()
})

function handleGetMovies(req, res) {
    let response = moviedex
    const { genre = "", country = "", avg_vote = "" } = req.query

    if(avg_vote){
        const avg = parseFloat(avg_vote)
        if(avg < 0 || avg > 10) {
            return res.status(400).send('Average vote (avg_vote) must be between 0 to 10')
        }
    }

    if(genre){
        response = response.filter(movie =>
            movie.genre.toLowerCase().includes(genre.toLowerCase()))
    }
    
    if(country){
        response = response.filter(movie => 
            movie.country.toLowerCase().includes(country.toLowerCase()))
    }

    if(avg_vote){
        response = response.filter(movie => 
            Number(movie.avg_vote) >= Number(avg_vote))
    }
    
    res.json(response)
}

app.get('/movie', handleGetMovies)

const PORT = 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})