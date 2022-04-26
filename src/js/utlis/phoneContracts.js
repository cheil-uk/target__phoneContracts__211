import axios from 'axios'
export async function phoneContracts (data, callback) {
  let sku = ''
  const pathName = window.location.pathname

  if (pathName.includes('galaxy-s')) {
    sku = BC_MODEL.displayCode
  } else if (pathName.includes('galaxy-note20')) {
    sku = BC_MODEL.displayCode
  } else {
    sku = digitalData.product.model_code || BC_MODEL.displayCode
  }

  try {
    const res = await axios.get(`https://p1-smn2-api-cdn.shop.samsung.com/tokocommercewebservices/v2/uk/carriers/device/${sku}/plans?fields=DEFAULT`, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'content-type': 'application/json',
        'x-ecom-app-id': 'web',
      },
    })
    // console.log(res)
    callback(res.data.carriers)
  } catch (error) {
    console.log(error)
  }
}
