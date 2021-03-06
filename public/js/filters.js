var FilterArray = [];
var previousVisSelected = "default";

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && charCode != 46 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}


function colDetectBarScatter(colElem1, colElem2, colElem3, colList){
  for (var i = 0; i < colList.length; i++){
    //console.log(colList[i].column_name.toLowerCase())
    switch (colList[i].column_name.toLowerCase()){
      case 'x':
      case 'height':
        colElem1.selectedIndex = i+1;
        switch (colElem1[i+1].value){
          case 'double precision':
            generateNumericColumnFilter('#xColumn');
            break;
          case 'text':
            generateTextColumnFilter('#xColumn');
            break;
          default:
            break;
        }
        break;

        // y column can potentially have less items than x, so need to check items
      case 'y':
      case 'weight':
        var index = 0;
        if (colElem2.length-1 < colList.length){
            for (index = 1; index < colElem2.length; index++){
              if(colElem2[index].text == colList[i].column_name){

                break;
              }
            }
        }
        else {
          index = i+1;
        }
          colElem2.selectedIndex = index;
          switch (colElem2[index].value){
            case 'double precision':
              generateNumericColumnFilter('#yColumn');
              break;
            case 'text':
              generateTextColumnFilter('#yColumn');
              break;
            default:
              break;
          }
          break;
      case 'z':
      case 'fatness':
        colElem3.selectedIndex = i+1;
        switch (colElem3[i+1].value){
          case 'double precision':
            generateNumericColumnFilter('#zColumn');
            break;
          case 'text':
            generateTextColumnFilter('#zColumn');
            break;
          default:
            break;
        }
        break;
      default:
        break;
      }
  }
}

function colDetectGlobe(col1Elem, col2Elem, col3Elem, colList){
  for (var i = 0; i < colList.length; i++){
    //console.log(colList[i].column_name.toLowerCase())
    switch (colList[i].column_name.toLowerCase()){
      case 'lat':
      case 'latitude':
      case 'lati':
        col1Elem.selectedIndex = i+1;
        break;
      case 'long':
      case 'longi':
      case 'longitude':
          col2Elem.selectedIndex = i+1;
          break;
      case 'mag':
      case 'magnitude':
      case 'magni':
        col3Elem.selectedIndex = i+1;
        break;
      default:
        break;
      }
  }
}


function colDetectBasketball(colElem1, colElem2, colElem3, colList){
  for (var i = 0; i < colList.length; i++){
    //console.log(colList[i].column_name.toLowerCase())
    switch (colList[i].column_name.toLowerCase()){
      case 'loc_x':
      case 'x':
      case 'location_x':
        colElem1.selectedIndex = i+1;
        break;
      case 'loc_y':
      case 'y':
      case 'location_y':
          colElem2.selectedIndex = i+1;
          break;
      case 'shot_made':
      case 'shot_flag':
      case 'shot':
        colElem3.selectedIndex = i+1;
        break;
      default:
        break;
      }
  }
}

function setDefaultDropDownValue(visSelected, col1, col2, col3, colList){
  var col1Elem = document.getElementById(col1);
  var col2Elem = document.getElementById(col2);
  var col3Elem = document.getElementById(col3);
  //console.log(visSelected);
  switch(visSelected){
    case 'basketball':
      colDetectBasketball(col1Elem, col2Elem, col3Elem, colList);
      break;
    case 'scatter':
    case 'bar':
      colDetectBarScatter(col1Elem, col2Elem, col3Elem, colList);
      break;
    case 'globe':
      colDetectGlobe(col1Elem, col2Elem, col3Elem, colList);
    default:
      break;
  }
}

function visChange(){

  var visualSelected =  $("#VisualList option:selected").val();
  var tableSelected = $("#TableList option:selected").text();

  $('#filters').hide();
  $('#filtersOption').show();
  hideFindNthlarge();

  // shouldn't have to do anything when visual is switched from scatter to bar
  if ((visualSelected == 'bar') || (visualSelected == 'scatter')){
    if ((previousVisSelected == 'bar') || (previousVisSelected == 'scatter')){
      previousVisSelected = visualSelected;
      return;
    }
  }


  // generating new table list
  $('#TableList').children('option:not(:first)').remove();  // remove old children
  $.getJSON('/tableforvis', {
     visual: visualSelected
  }, function(data){

    for (var i = 0; i < data.length; i++){
      $("#TableList").append('<option value="' + data[i].tablename + '">' + data[i].tablename + '</option>');
    }
    var tableElem = document.getElementById('TableList');
    tableElem.selectedIndex = 0;
    if (visualSelected == 'basketball')
      $("#TableList").append('<option value="NBA">NBA</option>');

    // append table from user's shared link if applicable
    var sharedID = GetURLParameter('shareid');
    if (sharedID != null){
        // append that table to the list
        $.getJSON('/tableforvis', {
            visual: visualSelected,
            sharekey: sharedID
        }, function(data2){
          $("#TableList").append('<option value="' + data2[0].tablename + '">' + data2[0].tablename + '</option>');
          var tempTableList = document.getElementById('TableList');
          if (visualSelected == 'basketball')
            tempTableList.selectedIndex = data.length+2;
          else
            tempTableList.selectedIndex = data.length+1;

          tableChange();
        });
    }
    else {
      detectTable();
    }
  });

  // remove all old filters and colums
  $('#filters1').html("");
  $('#filters2').html("");
  $('#filters3').html("");
  $("#columnSelection.off-canvas-submenu").html("");


  if (visualSelected == 'globe'){
    hideColumnOptions();
    createFindNthLarge();
  }
  if (visualSelected == 'basketball'){
    hideColumnOptions();
  }



  previousVisSelected = visualSelected;
}

$("#VisualList").change(function(){
  clearURLParams();
  visChange();
});

function hideColumnOptions(){
  $('#filters').hide();
  $('#filtersOption').hide();
  // $('#columnOption').hide();
  // $('#columnSelection').hide();
}


function createColsGlobe(visualSelected ,tableSelected){
  $("#columnSelection.off-canvas-submenu").html("");
  $.getJSON('/retrieveColumns', {
     tableName: tableSelected,
     dataType: ['double precision'],
     sharekey: GetURLParameter('shareid')
  }, function(data){

    // var htmlStr = "<option value='' selected='selected' disabled='disabled'> Choose Column </option>";
    var htmlStr_1 = "<option value='' selected='selected' disabled='disabled'> Choose latitude</option>";
    var htmlStr_2 = "<option value='' selected='selected' disabled='disabled'> Choose longitude</option>";
    var htmlStr_3 = "<option value='' selected='selected' disabled='disabled'> Choose magnitude</option>";

    for (var i = 0; i < data.length; i++){
      htmlStr_1 = htmlStr_1.concat('<option value="' + data[i].data_type + '">' + data[i].column_name + '</option>');
      htmlStr_2 = htmlStr_2.concat('<option value="' + data[i].data_type + '">' + data[i].column_name + '</option>');
      htmlStr_3 = htmlStr_3.concat('<option value="' + data[i].data_type + '">' + data[i].column_name + '</option>');

    }

    htmlStr_1 = htmlStr_1.concat('</select></li>');
    htmlStr_2 = htmlStr_2.concat('</select></li>');
    htmlStr_3 = htmlStr_3.concat('</select></li>');
    $("#columnSelection.off-canvas-submenu").append('<li><p>Latitude</p> <select id="xColumn">' + htmlStr_1);
    $("#columnSelection.off-canvas-submenu").append('<li><p>Longititude</p> <select id="yColumn">' + htmlStr_2);
    $("#columnSelection.off-canvas-submenu").append('<li><p>Magnitude</p> <select id="zColumn">' + htmlStr_3);

    setDefaultDropDownValue(visualSelected, 'xColumn', 'yColumn','zColumn', data);
    detectGlobeColsURL();
  });
}

function createFindNthLarge(){
  $("#globeFindNth.off-canvas-submenu").html("");
  $("#globeFindNth.off-canvas-submenu").append("<p> Find Nth Largest </p>");
  $("#globeFindNth.off-canvas-submenu").append('<form action="/find" method="post"><input type="text" name="nth" id="nth"><input type="button" value="Find" onclick="findNthLargest()"></form>');
  document.getElementById("nth").defaultValue = 1;
}

function hideFindNthlarge(){
  $("#globeFindNth.off-canvas-submenu").html("");
}

function createColsBar(visualSelected, tableSelected){

  $("#columnSelection.off-canvas-submenu").html("");
  $.getJSON('/retrieveColumns', {
     tableName: tableSelected,
     sharekey: GetURLParameter('shareid')
  }, function(data){
    // create a dropdown list
    // default at "Choose Column" to make sure user actually chooses a column
    var htmlStr = "<option value='' selected='selected' disabled='disabled'> Choose Column </option>";
    var htmlStrForY = "<option value='' selected='selected' disabled='disabled'> Choose Column </option>";
    // populate dropdown list with columnNames and Values
    for (var i = 0; i < data.length; i++){
      htmlStr = htmlStr.concat('<option value="' + data[i].data_type + '">' + data[i].column_name + '</option>');

      // for Y Column since Y should not contain any text
      if (data[i].data_type != 'text'){
        htmlStrForY = htmlStrForY.concat('<option value="' + data[i].data_type + '">' + data[i].column_name + '</option>');
      }
    }

    htmlStr = htmlStr.concat('</select></li>');
    $("#columnSelection.off-canvas-submenu").append('<li><p>X</p> <select id="xColumn">' + htmlStr);
    $("#columnSelection.off-canvas-submenu").append('<li><p>Y</p> <select id="yColumn">' + htmlStrForY);
    $("#columnSelection.off-canvas-submenu").append('<li><p>Z</p> <select id="zColumn">' + htmlStr);

    detectXYZGenVis();
    //setDefaultDropDownValue(visualSelected, 'xColumn', 'yColumn','zColumn', data);
    //generateBarFilters();

  });
}
function createColsScatter(visualSelected, tableSelected){
  $("#columnSelection.off-canvas-submenu").html("");
  $.getJSON('/retrieveColumns', {
     tableName: tableSelected,
     dataType: ['double precision'],
     sharekey: GetURLParameter('shareid')
  }, function(data){
    // create a dropdown list
    // default at "Choose Column" to make sure user actually chooses a column
    var htmlStr = "<option value='' selected='selected' disabled='disabled'> Choose Column </option>";

    // populate dropdown list with columnNames and Values
    for (var i = 0; i < data.length; i++){
      htmlStr = htmlStr.concat('<option value="' + data[i].data_type + '">' + data[i].column_name + '</option>');
    }

    htmlStr = htmlStr.concat('</select></li>');
    $("#columnSelection.off-canvas-submenu").append('<li><p>X</p> <select id="xColumn">' + htmlStr);
    $("#columnSelection.off-canvas-submenu").append('<li><p>Y</p> <select id="yColumn">' + htmlStr);
    $("#columnSelection.off-canvas-submenu").append('<li><p>Z</p> <select id="zColumn">' + htmlStr);

    //generateBarFilters();
    setDefaultDropDownValue(visualSelected, 'xColumn', 'yColumn','zColumn', data);
  });
}



function createColsBasketball(visualSelected, tableSelected){
  console.log("Table selected: " + tableSelected);
  $("#columnSelection.off-canvas-submenu").html("");
  $.getJSON('/retrieveColumns', {
     tableName: tableSelected,
     dataType: ['double precision'],
     sharekey: GetURLParameter('shareid')
  }, function(data){
    // create a dropdown list
    // default at "Choose Column" to make sure user actually chooses a column
    var htmlStr = "<option value='' selected='selected' disabled='disabled'> Choose Column </option>";
    // populate dropdown list with columnNames and Values
    for (var i = 0; i < data.length; i++){
      htmlStr = htmlStr.concat('<option value="' + data[i].data_type + '">' + data[i].column_name + '</option>');
    }

    htmlStr = htmlStr.concat('</select></li>');
    $("#columnSelection.off-canvas-submenu").append('<li><p>Court X</p> <select id="courtXColumn">' + htmlStr);
    $("#columnSelection.off-canvas-submenu").append('<li><p>Court Y</p> <select id="courtYColumn">' + htmlStr);
    $("#columnSelection.off-canvas-submenu").append('<li><p>Shot Result</p> <select id="shotColumn">' + htmlStr);

    setDefaultDropDownValue(visualSelected, 'courtXColumn', 'courtYColumn','shotColumn', data);
    // if theres parameters in URL, set to those
    detectBasketballColsURL();

  });
}

function tableChange(){
  var visualSelected =  $("#VisualList option:selected").val();

  // clear filters if exist
  $('#filters1').html("");
  $('#filters2').html("");
  $('#filters3').html("");


	switch(visualSelected){
		case 'bar':
      var tableSelected = $("#TableList option:selected").val();
      createColsBar(visualSelected, tableSelected);
      break;

		case 'scatter':
      var tableSelected = $("#TableList option:selected").val();
      createColsScatter(visualSelected, tableSelected);
			break;

    case 'basketball':
      var tableSelected = $("#TableList option:selected").val();
      if (tableSelected == 'NBA')
        createColsNBA();
      else{
        createColsBasketball(visualSelected, tableSelected);
      }
      break;


    case 'globe':
      var tableSelected = $("#TableList option:selected").val();
      createColsGlobe(visualSelected,tableSelected);
      break;

		default:
			alert("Please choose a Visualization");
			$("#TableList").val('');	// set it back to default
			break;
	}
}
// table selected, time to show columns.. See what kind of Visualization was chosen first
$("#TableList").change(function(){
  clearURLParams();
  tableChange();
});

// Changes for Dynamic Column
// each column will generate its own desired filters
$(document).on('change', '#xColumn', function(){
  switch (this.value){
    case 'double precision':
      generateNumericColumnFilter('#xColumn');
      break;
    case 'text':
      generateTextColumnFilter('#xColumn');
      break;
    default:
      break;
  }


});

$(document).on('change', '#yColumn', function(){
  switch (this.value){
    case 'double precision':
      generateNumericColumnFilter('#yColumn');
      break;
    case 'text':
      generateTextColumnFilter('#yColumn');
      break;
    default:
      break;
  }


});
$(document).on('change', '#zColumn', function(){
  switch (this.value){
    case 'double precision':
      generateNumericColumnFilter('#zColumn');
      break;
    case 'text':
      generateTextColumnFilter('#zColumn');
      break;
    default:
      break;
  }


});

function generateTextColumnFilter(colID){
  var tableSelected = $("#TableList option:selected").val();
  var ColName = $(colID.concat(" option:selected")).text();
  //var getMinMaxQuery = 'select max(' + ColName + '), min(' + ColName + ') FROM ' + tableSelected;
  //var getSelectionQuery = 'select distinct '+ColName+' from '+tableSelected+' where '+ColName+' is not null order by '+ColName;

  var filterID;
  var formID;
  var amountName;

  switch (colID){
    case '#xColumn':
      formID = "X";
      filterID = "#filters1";
      break;
    case '#yColumn':
      formID = "Y";
      filterID = "#filters2";
      break;
    case '#zColumn':
      formID = "Z";
      filterID = "#filters3";
      break;
  }

  // retrieve all items in column that's alphabeticalized. Then generate Check boxes.
  $.getJSON('/retrieveDistinctColValues', {
      tableName: tableSelected,
      columnName: ColName

  }, function(data){
    $(filterID).html("");
    //$(filterID).append('<input id=' + amountName.substring(1) + ' type=text onkeypress=”return isNumber(event);” ></input>' + '<div id=' + slideName.substring(1) + '></div>');
    var randomStr = formID + ':<form class="filterselect" id='+ formID + '><div class="fbox">'
    //$(filterID).append('<form id='+ formID +'>');

    for (var i = 0; i < data.length; i++){

      randomStr = randomStr.concat('\
        <input type="checkbox" value="'+data[i][ColName]+'" id="'+data[i][ColName]+'">\
        <label class="flabel" for="'+data[i][ColName]+'">'+data[i][ColName]+'</label>\
        <br>\
        ');


    }
    randomStr = randomStr.concat('</div></form>');

    //$(filterID).append('<div id="log"></div></form>');

    $(filterID).append(randomStr);

  });

}


function clearURLParams(){
  removeParam('visualization');
  //$.param.querystring(window.location.href, '');
  //window.location.href = window.location.href.replace(window.location.search,'');
}

function removeParam(parameter)
{
  var url=document.location.href;
  var urlparts= url.split('?');

 if (urlparts.length>=2)
 {
  var urlBase=urlparts.shift();
  window.history.pushState('',document.title,urlBase); // added this line to push the new url directly to url bar .

}
return url;
}

// create a filter for
function generateNumericColumnFilter(colID){
	var tableSelected = $("#TableList option:selected").val();
  var ColName = $(colID.concat(" option:selected")).text();
  var getMinMaxQuery = 'select max(' + ColName + '), min(' + ColName + ') FROM ' + tableSelected;



  var filterID;
  var slideName;
  var amountName;
  var filterLabel;
  switch (colID){
    case '#xColumn':
      slideName = "#sliderX";
      amountName = "#amountX";
      filterID = "#filters1";
      filterLabel = "X";
      break;
    case '#yColumn':
      slideName = "#sliderY";
      amountName = "#amountY";
      filterID = "#filters2";
      filterLabel = "Y";
      break;
    case '#zColumn':
      slideName = "#sliderZ";
      amountName = "#amountZ";
      filterID = "#filters3";
      filterLabel = "Z";
      break;
  }

  $.getJSON('/retrieveData', {
    tableName: tableSelected,
    columnList: ['max(' + ColName + ')', 'min(' + ColName + ')'],
    sharekey: GetURLParameter('shareid')

  }, function(data){
    $(filterID).html("");
    $(filterID).append(filterLabel + ':<input id=' + amountName.substring(1) + ' type=text onkeypress=”return isNumber(event);” readonly></input>' + '<div id=' + slideName.substring(1) + '></div>');
    var stepValue = 1;
    var dataDiff = data[0].max - data[0].min;

    if (dataDiff < 100){
        while(dataDiff  < 100 ){
          dataDiff = dataDiff * 10;
          stepValue = stepValue/10;
        }
    }


    var filterFrom = null;
    var filterTo = null;

    switch(colID){
      case '#xColumn':
        filterFrom = GetURLParameter('xFrom');
        filterTo = GetURLParameter('xTo');
        break;
      case '#yColumn':
        filterFrom = GetURLParameter('yFrom');
        filterTo = GetURLParameter('yTo');
        break;
      case '#zColumn':
        filterFrom = GetURLParameter('zFrom');
        filterTo = GetURLParameter('zTo');
        break;
    }
    var defautFrom;
    defaultFrom = Math.floor(parseFloat(data[0].min));
    var defaultTo;
    defaultTo = Math.ceil(parseFloat(data[0].max));
    if (filterFrom != null){
      var fromNum = parseFloat(filterFrom);
      if ((fromNum >= defaultFrom) && (fromNum <= defaultTo)){
        defaultFrom = fromNum;
      }
    }
    if (filterTo != null){
      var toNum = parseFloat(filterTo);
      if ((toNum >= defaultFrom) && (toNum <= defaultTo)){
        defaultTo = toNum;
      }

    }





    $( slideName ).slider({
    	range: true,
    	min: Math.floor(parseFloat(data[0].min)),
    	max: Math.ceil(parseFloat(data[0].max)),
    	values: [defaultFrom, defaultTo ],
      step: stepValue,
    	slide: function( event, ui ) {
    		$( amountName ).val(  ui.values[ 0 ] + " - " + ui.values[ 1 ] );
    	}

    	});
    	$( amountName ).val(  $( slideName ).slider( "values", 0 ) + " - " + $( slideName ).slider( "values", 1 ) );

      // set value for filters if applicable
    //  detectGenNumFiltersURL( colID, Math.floor(parseFloat(data[0].min), Math.ceil(parseFloat(data[0].max))));

  });
};

// Creates a query based on Table, Columns, and Filters for Bar and Scatter
function BarScatterFilterQuery(){
//  var tableSelected = $("#TableList option:selected").val();
  var x = $("#xColumn option:selected").text();
  var y = $("#yColumn option:selected").text();
  var z = $("#zColumn option:selected").text();

  var xType = $("#xColumn option:selected").val();
  var yType = $("#yColumn option:selected").val();
  var zType = $("#zColumn option:selected").val();

  var tempFrom;
  var tempTo;

  // start of query
//  var getColumnTypeQuery = "SELECT " + x + ", " + y + ", " + z + " from " + tableSelected;
  var getColumnTypeQuery = "";
  var startWord = "";

  /*
  select manufacturer_pregen, model, cpu_speed, _price from tryagainsmartphone where _price >= 200 and _price <= 400 and (manufacturer_pregen = 'Samsung'or manufacturer_pregen = 'HTC');
  $('form#X input:checked')[0]
  */

  switch(xType){
    case 'double precision':
      tempFrom = $( "#sliderX" ).slider( "values", 0 );
    	tempTo = $( "#sliderX" ).slider( "values", 1 );
    	if(tempFrom!=""){
    	 	getColumnTypeQuery = getColumnTypeQuery.concat(x+" >= " + tempFrom);
        startWord = " and";
      }
      if(tempTo!=""){
    		getColumnTypeQuery = getColumnTypeQuery.concat(startWord + " "+x+" <= " + tempTo);
        startWord = " and";
      }
      break;
    case 'text':
      // checkboxes are selected
      if ($('form#X input:checked').length != 0) {
        //and (manufacturer_pregen = 'Samsung'or manufacturer_pregen = 'HTC');
        getColumnTypeQuery = getColumnTypeQuery.concat(startWord + " (" + x + " = '" + $('form#X input:checked')[0].value + "'");
        for (var i = 1; i < $('form#X input:checked').length; i++){
          getColumnTypeQuery = getColumnTypeQuery.concat(" or " + x + " = '" + $('form#X input:checked')[i].value + "'");
        }
        getColumnTypeQuery = getColumnTypeQuery.concat(")");
        startWord = " and";
      }
      break;
    default:
      break;


  }


  switch(yType){
    case 'double precision':
      tempFrom = $( "#sliderY" ).slider( "values", 0 );
      tempTo = $( "#sliderY" ).slider( "values", 1 );
      if(tempFrom!=""){
        getColumnTypeQuery = getColumnTypeQuery.concat(startWord +" "+y+" >= " + tempFrom);
        startWord = " and";
      }
      if(tempTo!=""){
        getColumnTypeQuery = getColumnTypeQuery.concat(startWord +" "+y+" <= " + tempTo);
        startWord = " and";
      }
      break;
    case 'text':
      // checkboxes are selected
      if ($('form#Y input:checked').length != 0) {
        //and (manufacturer_pregen = 'Samsung'or manufacturer_pregen = 'HTC');
        getColumnTypeQuery = getColumnTypeQuery.concat(startWord + " (" + y + " = '" + $('form#Y input:checked')[0].value + "'");
        for (var i = 1; i < $('form#Y input:checked').length; i++){
          getColumnTypeQuery = getColumnTypeQuery.concat(" or " + y + " = '" + $('form#Y input:checked')[i].value + "'");
        }
        getColumnTypeQuery = getColumnTypeQuery.concat(")");
        startWord = " and";
      }
      break;
    default:
      break;
  }

  switch(zType){
    case 'double precision':
      tempFrom = $( "#sliderZ" ).slider( "values", 0 );
      tempTo = $( "#sliderZ" ).slider( "values", 1 );
      if(tempFrom!=""){
        getColumnTypeQuery = getColumnTypeQuery.concat(startWord +" "+z+" >= " + tempFrom);
        startWord = " and";
      }
      if(tempTo!=""){
        getColumnTypeQuery = getColumnTypeQuery.concat(startWord +" "+z+" <= " + tempTo);
        startWord = " and";
      }
      break;
    case 'text':
      // checkboxes are selected
      if ($('form#Z input:checked').length != 0) {
        //and (manufacturer_pregen = 'Samsung'or manufacturer_pregen = 'HTC');
        getColumnTypeQuery = getColumnTypeQuery.concat(startWord + " (" + z + " = '" + $('form#Z input:checked')[0].value + "'");
        for (var i = 1; i < $('form#Z input:checked').length; i++){
          getColumnTypeQuery = getColumnTypeQuery.concat(" or " + z + " = '" + $('form#Z input:checked')[i].value + "'");
        }
        getColumnTypeQuery = getColumnTypeQuery.concat(")");
        startWord = " and";
      }
      break;
    default:
      break;
  }

  console.log(getColumnTypeQuery);
  return getColumnTypeQuery;

}


// for NBA ONLY

function createColsNBA(){
    var curYear = new Date().getFullYear();
    var yearsSinceBeginning = curYear - 1990;
    $("#columnSelection.off-canvas-submenu").html("");
    var htmlStr = '<li><label>Year</label></li><li><select id="Season">';
    htmlStr = htmlStr.concat("<option value='' selected='selected' disabled='disabled'> Choose Season </option>");
    for (var i = 0; i < yearsSinceBeginning; i++){
      var tempStr = (curYear - (i+1)).toString() + " - " + (curYear - (i)).toString();
      var tempStr2 = (curYear - (i+1)).toString() + "-" + (curYear - (i)).toString();
      htmlStr = htmlStr.concat('<option value="' + tempStr2 + '">' + tempStr + '</option>');

    }
    htmlStr = htmlStr.concat('</select></li>');
    htmlStr = htmlStr.concat('<li><label>Team</label></li><li><select id="TeamName"><option value="" selected="selected" disabled="disabled"> Choose Team </option></select></li>');
    htmlStr = htmlStr.concat('<li><label>Player</label></li><li><select id="PlayerName"><option value="" selected="selected" disabled="disabled"> Choose Player </option></select></li>');
    $("#columnSelection.off-canvas-submenu").append(htmlStr);

    detectBasketballColsURL();
}

function seasonChange(seasonChosen){
  resetTeamList();
  genListOfTeam(seasonChosen);
  resetPlayerList();
}

function teamChange(teamChosen){
  genListOfPlayers(teamChosen);
}

// as the year change, we should generate a different list of teams
$(document).on('change', '#Season', function(){
  seasonChange(this.value);
});

$(document).on('change', '#TeamName', function(){
  teamChange(this.value);
});

function genListOfTeam(yearSpan){
  var yearSpanStr = yearSpan.toString();

  //2015 - 2016 -> 2015-16
  var yearID = yearSpanStr.slice(0,4) + "-" + yearSpanStr.slice(-2);

  var teamUrl = 'http://stats.nba.com/stats/leaguedashteamstats?Conference=&DateFrom=&DateTo=&Division=&GameScope=&GameSegment=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season='
    + yearID +
    '&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=0&VsConference=&VsDivision=';
    $.ajax({
      type: "GET",
      dataType: "jsonp",
      url: teamUrl,
      success: function(data) {
        var teamSet = data.resultSets[0].rowSet;
        for (var i = 0; i < teamSet.length; i++ ){
          //htmlStr = htmlStr.concat('<option value="' + teamSet[i][0] + '">' + teamSet[i][1] + '</option>');
          $("#TeamName").append('<option value="' + teamSet[i][0]+ '">' + teamSet[i][1]+ '</option>');
        }
        detectNBATeam();
      }
    });
};

function resetTeamList(){
  var col = document.getElementById('TeamName');
  $('#TeamName').children('option:not(:first)').remove();
  col.selectedIndex = 0;

}

function resetPlayerList(){
  var col = document.getElementById('PlayerName');
  $('#PlayerName').children('option:not(:first)').remove();
  col.selectedIndex = 0;

}

function genListOfPlayers(teamID){
  //2015 - 2016 -> 2015-16
  var yearSpanStr = $("#Season option:selected").text();
  var yearID = yearSpanStr.slice(0,4) + "-" + yearSpanStr.slice(-2);
  var playerURL = 'http://stats.nba.com/stats/teamplayerdashboard?DateFrom=&DateTo=&GameSegment=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PaceAdjust=N&PerMode=PerGame&Period=0&PlusMinus=N&Rank=N&Season='
  + yearID
  + '&SeasonSegment=&SeasonType=Regular+Season&TeamID='
  + teamID
  + '&VsConference=&VsDivision=';

  // EMPTY list of players first
  resetPlayerList();
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: playerURL,
    success: function(data) {
      var playerSet = data.resultSets[1].rowSet;
      var htmlStr = "<option value='' selected='selected' disabled='disabled'> Choose Player </option>";
      for (var i = 0; i < playerSet.length; i++ ){
        //htmlStr = htmlStr.concat('<option value="' + playerSet[i][1] + '">' + playerSet[i][2] + '</option>');
        $("#PlayerName").append('<option value="' + playerSet[i][1]+ '">' + playerSet[i][2]+ '</option>');
      }
      detectNBAPlayer();
    }
  });

}



function retreiveNBAData() {
  var patt = /\"resultSets\":\[/i;
  var seasonText = $("#Season option:selected").val();
  var seasonID = seasonText.slice(0,4) + "-" + seasonText.slice(-2);
  //var teamID = $("#TeamName option:selected").val();
  var playerID = $("#PlayerName option:selected").val();

  var webpage = 'http://stats.nba.com/stats/shotchartdetail?CFID=33&CFPARAMS='
  + seasonID
  + '&ContextFilter=&ContextMeasure=FGA&DateFrom=&DateTo=&GameID=&GameSegment=&LastNGames=0&LeagueID=00&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerID='
  + playerID
  + '&PlusMinus=N&Position=&Rank=N&RookieYear=&Season='
  + seasonID
  + '&SeasonSegment=&SeasonType=Regular+Season&TeamID=0&VsConference=&VsDivision=&mode=Advanced&showDetails=0&showShots=1&showZones=0';


  var bodycontent;
  $.ajax({
    type: "GET",
    dataType: "jsonp",
    url: webpage
  })
    .done(function(data) {
      parseShotData(data);
    });


}


function parseShotData(data){
  var shotList = data.resultSets[0].rowSet;
  var shotListLen = shotList.length;
  var zonesMiss = new Array(14);
  var zonesMade = new Array(14);
  // reset zonesMade/Miss array
  for (var i = 0; i < 14; i++){
    zonesMade[i] = 0;
    zonesMiss[i] = 0;
  }

  // going through each one and start doing computation
  for (var i = 0; i < shotListLen; i++){
    var indexX=0;
    var indexY=0;
    // if its a make
    if (shotList[i][10] == 'Made Shot'){
       indexX = Math.round((shotList[i][17]+250 )/10);
       indexY =Math.round((shotList[i][18] + 40)/10);  // add 40 to include the distance from base line to rim

      // for now we won't include shots from back court
       if (indexY >= 47)
        continue;
      zonesMade[PointToZone[indexY][indexX]]++;
    }
    else {
      indexX =  Math.round((shotList[i][17]+250 )/10);
      indexY = Math.round((shotList[i][18] + 40)/10) ; // add 40 to include the distance from base line to rim

      // for now we won't include shots from back court
      if (indexY >= 47)
        continue;

      zonesMiss[PointToZone[indexY][indexX]]++;
    }
  }

  generateZoneColor(zonesMade, zonesMiss);
  genPercentageText(zonesMade, zonesMiss);
}
