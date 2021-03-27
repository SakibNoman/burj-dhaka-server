const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const port = 4000

const app = express()

app.use(cors());
app.use(bodyParser.json());


var serviceAccount = require("./burj-dhaka-firebase-adminsdk-w4s1y-393710997e.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://burjDhakaUser:BurjDhakaPass@cluster0.cqpfg.mongodb.net/burjDhaka?retryWrites=true&w=majority";

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const bookings = client.db("burjDhaka").collection("booking");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/bookings', (req, res) => {
        const bearer = req.headers.authorization;
        if (bearer && bearer.startsWith('Bearer ')) {
            const idToken = bearer.split(' ')[1];
            console.log({ idToken });


            // idToken comes from the client app
            admin.auth().verifyIdToken(idToken)
                .then((decodedToken) => {
                    const tokenEmail = decodedToken.email;
                    console.log(tokenEmail, req.query.email);
                    if (tokenEmail === req.query.email) {
                        bookings.find({ email: req.query.email })
                            .toArray((err, documents) => {
                                res.send(documents);
                            })
                    }
                })
                .catch((error) => {
                    // Handle error
                });
        }


    })

});



app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.listen(port)


