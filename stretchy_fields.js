var stretchyField = {};

(function( $ ) {

    var methods = {
        init: function ( options ) {
          var forms = $(this).find('form');
          if(forms.length > 0) {
            forms.each( function (){
              $(this).addClass('hidden_element')
              stretchyField.inputs = initializeStretchyFields(this);
                if( stretchyField.inputs.length > 0 ) {
                  stretchyField.groups = initializeStretchyGroups(this);
                  hideOrShowGroupElements(stretchyField.groups);
                  $('a.stretchy_input').on("click", function() { $(this).stretchyFields('swapLinkForInput') } );
                  $('a.stretchy_group').on("click", function() { $(this).stretchyFields('swapLinkForGroup') } );
                  $('input.stretchy_input').on("blur", function() { $(this).stretchyFields('swapInputForLink') } );
                };
              $(this).removeClass('hidden_element');
              putFocusInFirstStretchyInput();
              });
           $(document).keydown( advanceFocusOnTab );
           };
        },
        swapLinkForInput: function() {
            var full_name = $(this).attr('id') ;
            var name = full_name.replace('_value', '');
            swapStretchyForTextInput(name);
            return true; },
        swapLinkForGroup: function() {
            var full_name = $(this).attr('id') ;
            var name = full_name.replace('_value', '');
            swapStretchyLinkForGroup(name, 'first');
            return true; },
        swapInputForLink: function() {
            var full_name = $(this).attr('id') ;
            var name = full_name.replace('_value', '');
            swapTextInputForStretchyControl(name);
            return true; }
    };


    $.fn.stretchyFields = function( method ) {
        return this.each(function() {
          var $this = $(this);
          // Method calling logic
          if ( methods[method] ) {
            return methods[ method ].apply( $this, Array.prototype.slice.call( arguments, 1 ));
          }
          else {
            if ( typeof method === 'object' || ! method ) {
                    return methods.init.apply( $this, arguments );
            }
            else {
              $.error( 'Method ' +  method + ' does not exist on jQuery.stretchyFields' );
            }
          }
        });
     };

    var putFocusInFirstStretchyInput = function(){
        var firstInput = stretchyField.inputs[0];
        var group = findGroupContaining( firstInput );
        if( group == null ){
            swapStretchyForTextInput( firstInput.name );
        }
        else {
            swapStretchyLinkForGroup( group.name, 'first' );
        };
    };

    var advanceFocusOnTab = function advanceFocusOnTab( e ) {
        var currentElementIndex = stretchyField.currentElementIndex ;
        var nextElementIndex;
        var nextElement;
        var direction;

        if( e.keyCode == 9 ) {
            if( e.shiftKey ) {
              direction = 'reverse' ;
              nextElementIndex = ( stretchyField.currentElementIndex == 0  ? stretchyField.inputs.length - 1 : stretchyField.currentElementIndex - 1 );
            }
            else {
              direction = 'forward';
              nextElementIndex = ( stretchyField.currentElementIndex   == (stretchyField.inputs.length - 1) ) ? 0 : stretchyField.currentElementIndex + 1 ;
            };
            nextElement = findElementByIndex( nextElementIndex );
            if(stretchyField.inputs[nextElementIndex].className.search(/stretchy/) > -1) {
                var group = findGroupContaining( nextElement );
                if( group != null ) {
                    if( direction == 'forward' ) {
                        if( nextElementIndex == group.firstElementIndex ) {
                            swapStretchyLinkForGroup( group.name, 'first' );
                        }
                        else
                        {
                            swapStretchyForTextInput(stretchyField.inputs[nextElementIndex].name);
                        }
                    }
                    else {
                        if( nextElementIndex == group.lastElementIndex ) {
                            swapStretchyLinkForGroup( group.name, 'last' );
                        }
                        else
                        {
                            swapStretchyForTextInput(stretchyField.inputs[nextElementIndex].name);
                        }
                    }
                }
               else {
                   swapStretchyForTextInput(stretchyField.inputs[nextElementIndex].name);
                }
            }
            else {
                var nonStretchyElement = setCurrentElement( stretchyField.inputs[nextElementIndex].name );
                $( '#' + nonStretchyElement.name).focus();
            };
            return false;
        }
        else {
          return true;
        }
    };

    var  setCurrentElement = function( elementName ) {
        var lastElement = findElementByName( stretchyField.currentElementName );
        var lastGroupName = stretchyField.currentGroupName;
        var currentElement = findElementByName( elementName );

        stretchyField.currentElementName = currentElement.name;
        stretchyField.currentElementIndex = currentElement.index;

        var currentGroup = findGroupContaining( currentElement );
        stretchyField.currentGroupName = (currentGroup == null ? null : currentGroup.name);

        if( currentGroup == null && lastGroupName != null ) {
            resetGroup( lastGroupName );
        };
        return currentElement;
    };

    var findGroupContaining = function(element){
        var group = null;
        if(stretchyField.groups.length > 0){
            for( var g = 0; g < stretchyField.groups.length; g++){
                if( element.index >= stretchyField.groups[g].firstElementIndex && element.index <= stretchyField.groups[g].lastElementIndex ){
                    group = stretchyField.groups[g]
                    break;
                };
            };
        };
        return group;
    };

    var resetGroup = function(groupName){
        if( elementsAreChanged(groupName) ){
            $('#' + groupName + '_stretchy').css('display','none');
            $('#' + groupName).css('display','block');
        }
        else {
            $('#' + groupName).css('display','none');
            $('#' + groupName + '_stretchy').css('display','block');
        }
    };

    var swapStretchyForTextInput = function (elementName) {
        var inputID = '#' + elementName;
        var inputWrapper = inputID + '_input';
        var linkText = inputID + '_value';
        var linkWrapper = inputID + '_stretchy';

        $(linkWrapper).css('display','none');
        $(inputWrapper).css('display', 'block');
        $(inputID).focus();
        $(inputID).select();
        setCurrentElement(elementName);
    };

    var swapStretchyLinkForGroup = function(groupName, elementPosition) {
        $('#' + groupName + '_stretchy').css('display','none');
        $('#' + groupName).css('display','block');
        if(elementPosition == 'first'){
            setFocusToFirstInputInside( groupName );
        }
        else {
            setFocusToLastInputInside( groupName );
        };
    };

    var setFocusToFirstInputInside = function(groupName){
        var group = findGroup(groupName);
        var elementIndex = group.firstElementIndex;
        var element = findElementByIndex(elementIndex);
        swapStretchyForTextInput(element.name);
        return element.name;
    };

    var setFocusToLastInputInside = function(groupName){
        var group = findGroup(groupName);
        var elementIndex = group.lastElementIndex;
        var element = findElementByIndex(elementIndex);
        swapStretchyForTextInput(element.name);
        return element.name;
    };

    var findGroup = function(groupName){
        var group;
        for( var g=0; g< stretchyField.groups.length; g++){
            if(stretchyField.groups[g].name == groupName){
                group = stretchyField.groups[g];
                break;
            };
        };
        return group;
    };

    var findElementByIndex = function(elementIndex){
        var element;
        for(var e=0; e< stretchyField.inputs.length; e++){
            if(stretchyField.inputs[e].index == elementIndex){
                element = stretchyField.inputs[e];
                break;
            };
        };
        return element;
    };

    var findElementByName = function(elementName){
        var element;
        for(var e=0; e< stretchyField.inputs.length; e++){
            if(stretchyField.inputs[e].name == elementName){
                element = stretchyField.inputs[e];
                break;
            };
        };
        return element;
    };

    var swapTextInputForStretchyControl = function(elementName) {
        var inputID = '#' + elementName;
        var inputWrapper = inputID + '_input';
        var linkText = inputID + '_value';
        var linkWrapper = inputID + '_stretchy';

        var user_input = $(inputID).val();
        var default_value;
        var original_value;

        var required = $(inputID).attr("required") != null;
        for( var i=0; i < stretchyField.inputs.length; i ++) {
            if(stretchyField.inputs[i].name == elementName) {
                default_value = stretchyField.inputs[i].defaultValue;
                original_value = stretchyField.inputs[i].originalValue;
                break;
            }
        };

        $(inputWrapper).css('display','none');
        $(linkWrapper).css('display','block');
        if (user_input.length > 0 && user_input != default_value && user_input != original_value)
        {
            $(linkText).text(user_input);
            $(linkText).css('color', 'black');
            $(inputID).val(user_input);
        }
        else
        {
            if (user_input == original_value) {
                if(original_value == null || original_value == ""){
                  $(linkText).text(default_value);
                  $(inputID).val(default_value);
                }
                else {
                  $(linkText).text(original_value);
                  $(inputID).val(original_value);
                }
                $(linkText).css('color', '#888888');
            }
            else {
                $(linkText).text(default_value);
                $(linkText).css('color', '#888888');
                $(inputID).val(default_value);
            }
        }
    };

    var initializeStretchyFields = function(obj) {
        var tabbableElements = [];
        tabbableElements.length = 0;

        var thisForm = $(obj);
        if ( thisForm != null ) {
            var allInputElements = thisForm.find('input.stretchy_input');
            allInputElements.each(function(index){
              var newElement = new stretchyElement(index, $(this).attr('id'), "stretchy_input", $(this).attr("default_value"), $(this).val() );
              if($(this).val() == null || $(this).val() == ""){$(this).val($(this).attr("default_value"))};
              tabbableElements.push(newElement);
              wrapStretchyInput(this, newElement);
            });
            tabbableElements = addSubmitButtonsFor( thisForm, tabbableElements );
        };
        return tabbableElements;
    };

    var addSubmitButtonsFor = function( formObject, elementsArray ){
        var submitElements = formObject.find('input[type="submit"]');
        submitElements.each(function() {
            var newElement = new stretchyElement(elementsArray.length, $(this).attr('id'), "button", "", "" );
            elementsArray.push(newElement);
        });
        var holding = 0;
        return elementsArray;
        };

    var wrapStretchyInput = function(obj, stretchyFieldElement) {
      $(obj).wrap('<div id="' + obj.id + '_input" class="stretchy_input_wrapper"></div>');
      $('#' + obj.id + '_input').wrap('<div class="stretchy_input_field"></div>');
      var required = $(obj).attr("required") != null;
      var stretchy_div = '<div id="' + obj.id + '_stretchy" class=' + (required ? "stretchy_box" : "stretchy_link") + ' >';
      var link_id = obj.id + '_value';
      stretchy_div += '<ul><li><a id=' + link_id + ' class="stretchy_input" ></a></li></ul></div>'
      $('#' + obj.id+ '_input').before(stretchy_div);
      populateLink(link_id, stretchyFieldElement);
    };

    var populateLink =  function(element_id, stretchyFieldElement) {
        var link = $('#' + element_id);

    if(stretchyFieldElement.originalValue == null || stretchyFieldElement.originalValue == "") { link.text(stretchyFieldElement.defaultValue); }
    else { link.text(stretchyFieldElement.originalValue); }
    };

    var initializeStretchyGroups = function(obj) {
        var groupElements = [];
        groupElements.length = 0;

        var allGroups = $(obj).find('div.stretchy_group');
        allGroups.each(function(index){
            var firstElement = $(this).find('input.stretchy_input').first();
            var lastElement = $(this).find('input.stretchy_input').last();
            var firstElementIndex = findIndexOf(firstElement);
            var lastElementIndex = findIndexOf(lastElement);
            var newGroup = new stretchyGroup($(this).attr('id'), firstElementIndex, lastElementIndex);
            groupElements.push(newGroup);
            wrapStretchyGroup(this);
        });
        return groupElements;
    };

    var findIndexOf = function(obj) {
        var elementID = obj.attr('id');
        var index;

        for( var i = 0; i < stretchyField.inputs.length; i++) {
            if( stretchyField.inputs[i].name == elementID ) {
                index = stretchyField.inputs[i].index;
                break;};
        };
        return index;
    };

    var wrapStretchyGroup = function(obj) {
       $(obj).before( stretchyGroupLink(obj) );
    };

    var hideOrShowGroupElements = function( groups ) {
        if( groups.length > 0 ) {
            for( var g = 0; g < groups.length; g++) {
                var group_link = '#' + stretchyField.groups[g].name + '_link';
                var group = '#' + stretchyField.groups[g].name;
               if( elementsAreChanged(stretchyField.groups[g].name) ){
                    $(group_link).addClass('hidden_element');
                    $(group).removeClass('hidden_element');
                   }
                else {
                    $(group_link).removeClass('hidden_element');
                    $(group).addClass('hidden_element');
                    }
                };
            };
        return true;
    };

    var elementsAreChanged = function(groupName) {
        var changed = false;
        var group = findGroup( groupName );
        for( var e = group.firstElementIndex; e <= group.lastElementIndex; e++){
            if( stretchyField.inputs[e].defaultValue != $('#' + stretchyField.inputs[e].name).val() ) {
                changed = true;
                break;
            };
        };
        return changed;
    };

    var stretchyGroupLink = function(element) {
        var linkHtml;
        linkHtml = '<div id="' + $(element).attr('id') + '_stretchy">';
            linkHtml += '<div class="form_text_input" style="border-top:0px;">';
                linkHtml += '<label for="Address" >Address </label>';
                linkHtml += '<div id="contact_address_link" class="stretchy_link" style="display:block" >';
                    linkHtml += '<ul><li><a id="' + $(element).attr('id') + '_value" class="stretchy_group" >';
                    linkHtml += 'Optional';
                    linkHtml += '</a></li></ul>';
                linkHtml += '</div>';
            linkHtml += '</div>';
        linkHtml += '</div>';
        return linkHtml;
    };

    var stretchyGroup = function(name, firstElementIndex, lastElementIndex) {
        this.name = name;
        this.firstElementIndex = firstElementIndex;
        this.lastElementIndex = lastElementIndex;
    };

    var stretchyElement = function(index, name, className, defaultValue, originalValue) {
        this.index = index;
        this.name = name;
        this.className = className;
        this.defaultValue = defaultValue;
        this.originalValue = originalValue;
    };
})( jQuery );