const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const JWTSecret = "sajnsdaohwoye18287296@#$716894^^`´~~ás09---asacxcxh";

app.use(cors());
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//Middleware
function auth(req, res, next){
    const authToken = req.header('authorization');

    if(authToken != undefined){

        const bearer = authToken.split(' ');
        var token = bearer[1];

        jwt.verify(token, JWTSecret, (erro, data) => {
            if(erro){
                res.status(401);
                res.json({erro: "Token inválido"});
            }
            else{
                req.token = token;
                req.loggerUser = {id: data.id, email: data.email};
                next();
            }
        })
    }
    else{
        res.status(401);
        res.json({erro: "Token inválido"});
    }
}


let DB = {

    games: [
        {
          id: 1,
          title: "Call of Duty MW",
          year: 2010,
          price: 60   
        },
        {
            id: 2,
            title: "Ses of thieves",
            year: 2018,
            price: 40   
        },
        {
            id: 3,
            title: "Minecraft",
            year: 2012,
            price: 20   
        }
    ],

    users: [
        {
            id: 1,
            nome: "Diones Alves",
            email: "pereiradiones987@gmail.com",
            senha: "123"
        },
        {
            id: 3,
            nome: "Ana Silva",
            email: "anasilva@gmail.com",
            senha: "123"
        }
    ]

}

app.get("/games",auth,(req, res) => {//Listando todos os dados da API

    var HATEOAS = [
        {
            href: "http://localhost:3000/game/0",
            method: "DELETE",
            rel: "deleta_game"
        },
        {
            href: "http://localhost:3000/game/0",
            method: "GET",
            rel: "get_game"
        },
        {
            href: "http://localhost:3000/auth",
            method: "POST",
            rel: "login"
        }
    ]

    res.statusCode = 200;
    res.json({games: DB.games, _links: HATEOAS});
});

app.get("/game/:id", auth ,(req, res) => {//Listando os dados de um API especifica pelo id

    //Verificarndo se o id é um numero
    if(isNaN(req.params.id)){//Se não for um número
        res.sendStatus(400);
    }
    else{//Se for um número
        let id = parseInt(req.params.id);

        var HATEOAS = [
            {
                href: "http://localhost:3000/game/"+id,
                method: "DELETE",
                rel: "deleta_game"
            },
            {
                href: "http://localhost:3000/game/"+id,
                method: "PUT",
                rel: "edit_game"
            },
            {
                href: "http://localhost:3000/game/"+id,
                method: "GET",
                rel: "get_game"
            },
            {
                href: "http://localhost:3000/games",
                method: "GET",
                rel: "get_all_games"
            }
        ]

        let game = DB.games.find( g => g.id == id);

        if(game != undefined){//Se game não for nulo
            res.statusCode = 200;
            res.json({game, _links: HATEOAS});
        }
        else{//Se for nulo
            res.sendStatus(404);
        }
    }
});

app.post("/game", auth, (req, res) => {//Enviando dados de uma API pelo método POST
    let {title, price, year} = req.body;

    if((title != null) && (price != isNaN) && (year != isNaN)){
        DB.games.push(
            {
                id: 4,
                title,
                price,
                year
            }
        );

        res.sendStatus(200);
    }
    else{
        res.sendStatus(400);
    }
});

app.delete("/game/:id", auth, (req, res) => {
    //Verificarndo se o id é um numero
    if(isNaN(req.params.id)){//Se não for um número
        res.sendStatus(400);
    }
    else{//Se for um número
        let id = parseInt(req.params.id);
        let index = DB.games.findIndex( g => g.id == id);

        if(index == -1){
            res.sendStatus(404);
        }
        else{
            DB.games.splice(index, 1);
            res.sendStatus(200);
        }

        
    }
});

app.put("/game/:id", auth,(req, res) => {
    //Verificarndo se o id é um numero
    if(isNaN(req.params.id)){//Se não for um número
        res.sendStatus(400);
    }
    else{//Se for um número
        let id = parseInt(req.params.id);

        let game = DB.games.find( g => g.id == id);

        if(game != undefined){//Se game não for nulo

            let {title, price, year} = req.body;

            if(title != undefined){
                game.title = title;
            }

            if(price != undefined){
                game.price = price;
            }

            if(year != undefined){
                game.year = year;
            }

            res.sendStatus(200);

        }
        else{//Se for nulo
            res.sendStatus(404);
        }
    }
});

app.post("/auth",(req, res) => {
    var {email, senha} = req.body;

    if(email != undefined){
        
        var user = DB.users.find(u => u.email == email);

        if(user != undefined){

            if(user.senha == senha){

                jwt.sign({
                    id: user.id, 
                    email: user.email
                }, JWTSecret, {expiresIn: "48h"}, (erro, token) => {
                    if(erro){
                        res.status(400);
                        res.json({erro: "Falha interna"});
                    }
                    else{
                        res.status(200);
                        res.json({token: token});
                    }
                });
                
            }
            else{
                res.status(401);
                res.json({erro: "Credenciais inválidas!"});
            }

        } 
        else{
            res.status(404);
            res.json({erro: "E-mail enviado não existe"});
        }

    }
    else{
        res.status(400);
        res.json({erro: "E-mail enviado é inválido"});
    }
});

app.listen(3000, () => {
    console.log("Servidor iniciado com sucesso!");
});