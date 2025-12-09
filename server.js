const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Importa rotas
const productsRoutes = require('./routes/products');
const italoBasesRoutes = require('./routes/italoBases');

app.use('/products', productsRoutes);
app.use('/italoBases', italoBasesRoutes);

// Inicia servidor
app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
});
