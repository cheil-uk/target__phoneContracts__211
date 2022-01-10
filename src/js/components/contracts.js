import axios from 'axios'
import { forEach } from 'lodash';

export default class Contracts {
  async phoneContracts() {
  let sku = '';
  const pathName = window.location.pathname;

  if (pathName.includes('galaxy-s')) {
  sku = BC_MODEL.displayCode;
    } else if (pathName.includes('galaxy-note20')) {
      sku = BC_MODEL.displayCode;
    } else {
      sku = digitalData.product.model_code || BC_MODEL.displayCode;
  }

  try {
   const res = await axios.get(`https://p1-smn2-api-cdn.shop.samsung.com/tokocommercewebservices/v2/uk/carriers/device/${sku}/plans?fields=DEFAULT`,
   {
    headers: {
       "Access-Control-Allow-Origin": "*",
       "content-type": "application/json",
       "x-ecom-app-id": "web",
     },
   });
   // console.log(res);
   const carriers = res.data.carriers;
   this.contracts(carriers)
  }
  catch(error) {
   console.log(error)
  }
  }

  goToCarrier(blockId) {
    const phoneContractId = blockId + 1;
    const carrierTabs = document.querySelectorAll('.tariff-popup__tab-item');
    let tab = ''

    carrierTabs.forEach((carrierTab, carrierTabIndex) => {

      if (phoneContractId === carrierTabIndex) {
          tab = carrierTab.attributes[1].value;

          setTimeout( () => {
            document.getElementById(tab).click();
          }, 1000)

      }
    })
  }

  tagging(el, attrs) {
    for(let key in attrs) {
      el.setAttribute(key, attrs[key]);
    }
  }

  getLowPrice(networkPlans) {
    const carrierPlans = networkPlans
    let allPricesArr = [];

    carrierPlans.map((carrierPlan) => {

      const carrierName = carrierPlan.carrier;
      let carrierMonthlyRate = carrierPlan.pricing.monthly_rate.value
      const numMonthlyRate = parseFloat(carrierMonthlyRate);

      allPricesArr.push(numMonthlyRate);
    })

    const sortArr = allPricesArr.sort((a, b) => a - b);
    const minPrice = sortArr[0];
    return minPrice
  }

  contracts(carriers) {
  //change text
  let contractCopy = document.querySelector("#offer_tariff > div.hubble-product__options-content-inner > p")
  contractCopy.classList.add('contract_copy');
  contractCopy.innerHTML = `<span class="s-option-default">Choose a network and a bundle of minutes, texts and data to buy with your phone</span>`
  //loop through all contracts
  const container = document.createElement('div');
  container.classList.add('contracts_container');
  const offerSection = document.querySelector("#offer_tariff > div.hubble-product__options-content-inner");
  const path = window.location.pathname;

  carriers.map((carrier) => {
    // console.log(carrier)
    const contractImg       = carrier.additionalCarrierInfo.medias[0].url;
    const contractImgAlt    = carrier.additionalCarrierInfo.medias[0].altText;
    const minPrice          = this.getLowPrice(carrier.tariffPlans);
    const network           = carrier.id
    const block             = document.createElement('div');
    const ticketNum         = 733;

    block.classList.add('contracts_block');

    this.tagging(block,
      { "data-omni-type"  : "microsite",
        "data-omni"       : `uk:${ticketNum}:pdp:phonecontracts:carriername:${network}`,
        "ga-ac"           : "pd buying tool",
        "ga-ca"           : "option click",
        "ga-la"           : `tariff:apply:${network}`
      });

    block.innerHTML = `
    <div class="contracts_selector" data-omni-type="microsite" data-omni="uk:${ticketNum}:pdp:phonecontracts:networkname-${network}">
      <img class="contracts_${contractImgAlt}" src="${contractImg}" alt="${contractImgAlt}" />
      <span class="contracts_price">From £${minPrice}.00/month</span>
    </div>
    `
    container.append(block);
    offerSection.append(container);
    document.querySelector("#offer_tariff > div.hubble-product__options-content-cta > a").style.display = 'none'
  });

    (path == '/uk/smartphones/galaxy-z-fold3-5g/buy/') ? container.after('RPI/CPI changes apply****') : container.after('RPI/CPI changes apply***');

    const allBlocks = document.querySelectorAll('.contracts_block');

    allBlocks.forEach((allBlock, blockId) => {
      allBlock.onclick = (e) => {
      document.querySelector("#offer_tariff > div.hubble-product__options-content-cta > a").click();
      e.preventDefault();
      this.goToCarrier(blockId)
    }
    })
  }

}
