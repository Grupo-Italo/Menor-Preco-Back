const axios = require('axios');

exports.search = async (local, gtin, termo) => {
    const params = {
        local,
        ...(gtin && { gtin }),
        ...(termo && { termo })
    };

    const response = await axios.get(
        'https://menorpreco.notaparana.pr.gov.br/api/v1/produtos',
        { params }
    );

    return response.data;
};
