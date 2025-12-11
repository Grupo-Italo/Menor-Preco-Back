const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const productsRoutes = require('./routes/products');
const italoBasesRoutes = require('./routes/italoBases');
const notaParanaRoutes = require('./routes/notaparana');
const italoGroupsRoutes = require('./routes/italoGroups');

app.use('/products', productsRoutes);
app.use('/italoBases', italoBasesRoutes);
app.use('/nota-parana', notaParanaRoutes);
app.use('/italoGroups', italoGroupsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
