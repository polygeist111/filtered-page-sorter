const productURL = "https://api.commerce7.com/v1/product?cursor=";
const collectionURL = "https://api.commerce7.com/v1/collection?page=1";
const appID = "distribution-catalog-generator";
const ASK = "sbDyLLpdhqqRIv43RgMvQmkaBk9rCBXS7viFpYSHdg6XtaXn6oT0FzCY3wGZtN94";

let button1;

let productList = [];
let wineList = [];
let wines = [];
let pricedWineList = [];

function setup() {
  createCanvas(400, 400);

  button1 = createButton('Sort Shop Page');
  button1.parent("canvas_shell");
  //button1.mousePressed(populateProducts("start"));
  button1.mousePressed(testButton);
  //button1.position(200, 200);
  //console.log(width * 0.5 - button1.width * 0.5, height * 0.5 - button1.height * 0.5);
  button1.position(width * 0.5 - button1.width * 0.5, height * 0.5 - button1.height * 0.5);
}

function draw() {
  background(220);
  stroke(0);
  strokeWeight(3);
  line(0, 0, 0, height);
  line(0, height, width, height);
  line(width, height, width, 0);
  line(width, 0, 0, 0);
}

function testButton() {
  //console.log('button works');
  //populateProducts("start");
  fetchCollections(collectionURL);

}


//Recursively fills produtsList with all products in C7
function populateProducts(cursorIn) {
  fetchWines(productURL + cursorIn)
  .then(m => { 
    m[0].forEach(item => append(productList, item));
    console.log(productList);
    console.log(m[1]);
    if (m[1] != null) {
      populateProducts(m[1]);
    } else {
      populateWineList();
    }
  })
  .catch(e => { console.log(e) });
}



//API/Sorting stuff

//Requests 50 product pages from C7
async function fetchWines(url = "") {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic ZmlsdGVyZWQtcGFnZS1zb3J0ZXI6c2JEeUxMcGRocXFSSXY0M1JnTXZRbWthQms5ckNCWFM3dmlGcFlTSGRnNlh0YVhuNm9UMEZ6Q1kzd0dadE45NA==",
      "Tenant": "archetyp",
    },
  });
  const parsedJSON = await response.json();
  const newCursor = await parsedJSON.cursor;
  const products = await parsedJSON.products;
  return [products, newCursor]; //returns array of products as well as ending cursor value (essentially, next page index)

} 

async function fetchCollections(url = "") {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Basic ZmlsdGVyZWQtcGFnZS1zb3J0ZXI6c2JEeUxMcGRocXFSSXY0M1JnTXZRbWthQms5ckNCWFM3dmlGcFlTSGRnNlh0YVhuNm9UMEZ6Q1kzd0dadE45NA==",
      "Tenant": "archetyp",
    },
  });
  const parsedJSON = await response.json();
  console.log(parsedJSON);
  //const newCursor = await parsedJSON.cursor;
  //const collections = await parsedJSON.products;
  //return [products, newCursor]; //returns array of products as well as ending cursor value (essentially, next page index)

} 


//Filters productList to wineList, making sure only available wines and bundles are included
function populateWineList() {
  productList.forEach(item => {
    if(item.webStatus === "Available" && (item.type === "Wine")) { 
      append(wineList, item) } 
  });
  sortWineList();
}



//Sorts wineList alpha by maker, then wine, then bundles by alpha at end (commented out sections are logic to sort bundles)
function sortWineList() {
  let wines = [];
  //let bundles = [];
  wineList.sort((a,b) => makerName(a.title).localeCompare(makerName(b.title)));
  wineList.sort(function (a,b) {
    if (makerName(a.title).localeCompare(makerName(b.title)) == 0) {
      return wineName(a).localeCompare(wineName(b));
    }
    return 0;
  });
  wineList.forEach(function(item) {
    if (item.type === "Wine") { append(wines, item); }
    //if (item.type === "Bundle") { append(bundles, item); }
  });
  for (var i = 0; i < wines.length; i++) {
    wineList.splice(i, 1, wines[i]);
  }
  console.log(wineList);
  
  //moves winelist into 2d array with space for prices
  for (var w = 0; w < wineList.length; w++) {
    let toPush = [wineList[w]]
      for (var i = 0; i <= wineList[w].variants.length; i++) {
        toPush.push("");
    }
    pricedWineList.push(toPush);
  }
  console.log(pricedWineList);
  getMakers();
  if (document.getElementById('authorize_button').innerText == "Refresh") { getPrices(); }
  loop();
}



//Returns wine title without vintage
function makerName(name) {
  if (name.substring(0,1) === "2") {
    return name.substring(5);
  } else return name;

}



//Returns only actual maker name, no wine name
function justMakerName(wineIn) {
  let name = wineIn.title
  let makeName = makerName(name);
  let bottleName;
  
  bottleName = wineName(wineIn);
  let result =  makeName.substring(0, makeName.length - bottleName.length - 1);
  //if (!makers.includes(result)) { makers.push(result); console.log("hi"); } else { console.log("bye"); }
  return result;

}


//Returns wine title without vintage or maker
function wineName(wine) {
  let name = makerName(wine.title);
  let makerNameSpace;
  if (wine.vendor != null) {
    makerNameSpace = wine.vendor.title.length;
  } else return name;
  if (wine.vendor.title == "Vinodea / Andrea Schenter") {
    makerNameSpace = 7;
  }
  return name.substring(makerNameSpace + 1);

}



/*
*
*
*JSON response format
*{id: 'anything unique', type: '', message: ''}
*"Type" ENUMs: error, info, success
*https://developer.commerce7.com/docs/app-extensions
*
*/


/*

General idea:
seeing as you can't directly update collection contents via api,
sort collection alphabetically excluding vintage,
then iterate from a to z, remove product from active collection if it's there
iterate a to z again, add back in order

*/