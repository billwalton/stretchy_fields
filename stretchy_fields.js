var stretchyField = {};

(function( $ ) {

    var methods = {
        init: function ( options ) {
            var forms = $(this).find('form');
            if(forms.length > 0) {
                forms.each( function (){
                    $(this).on("submit", function() { $(this).stretchyFields('clearDefaults') } );
                    $(document).keydown( advanceFocusOnTab );	
                    $(this).addClass('hidden_element');
                    stretchyField.inputs = initializeStretchyFields(this);
                    if( stretchyField.inputs.length > 0 ) {
                        stretchyField.groups = initializeStretchyGroups(this);
                        finalizeStretchyGroups(stretchyField.groups);
                        $('a.stretchy_input').on("click", function() { $(this).stretchyFields('swapLinkForInput') } );
                        $('a.stretchy_group').on("click", function() { $(this).stretchyFields('swapLinkForGroup') } );
                        $('input.stretchy_input').on("blur", function() { $(this).stretchyFields('swapInputForLink') } );
                        setPseudoDefaultValues( stretchyField );
                        populateLinks();
                    };
                    $(this).removeClass('hidden_element');
                    putFocusInFirstStretchyInput();                    
                });
            };
        },
        swapLinkForInput: function() {
            var full_name = $(this).attr('id') ;
            var name = full_name.replace('_value', '');
            swapStretchyForTextInput(name);
            return false; },
        swapLinkForGroup: function() {
            var full_name = $(this).attr('id') ;
            var name = full_name.replace('_value', '');
            swapStretchyLinkForGroup(name, 'first');
            return false; },
        swapInputForLink: function() {
            var full_name = $(this).attr('id') ;
            var name = full_name.replace('_value', '');
            swapTextInputForStretchyControl(name);
            return false; },
        clearDefaults: function() {
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
            setFocusToFirstInputInside( group.name );
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
        var group = findGroupByName(groupName);
        var elementIndex = group.firstElementIndex;
        var element = findElementByIndex(elementIndex);
        swapStretchyForTextInput(element.name);
        return element.name;
    };

    var setFocusToLastInputInside = function(groupName){
        var group = findGroupByName(groupName);
        var elementIndex = group.lastElementIndex;
        var element = findElementByIndex(elementIndex);
        swapStretchyForTextInput(element.name);
        return element.name;
    };

    var findGroupByName = function(groupName){
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
        var original_text_color;
        var pseudo_default_value;
        var element;
        
        element = findElementByName( elementName );
        default_value = element.defaultValue;
        pseudo_default_value = element.pseudoDefaultValue;
        original_value = element.originalValue;
        original_text_color = element.linkTextColor;
        

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
                    if( default_value ) {
                        $(linkText).text(default_value);
                        $(inputID).val(default_value);
                        $(linkText).css('color', original_text_color);
                    }
                    else {
                        var textColor = $(linkText).parents('ul').css('background-color');
                        $(linkText).text(pseudo_default_value);                        
                        $(linkText).css('color', textColor);
                    };
                }
                else {
                  $(linkText).text(original_value);
                  $(inputID).val(original_value);
                }
            }
            else {
                if( default_value ) {
                    $(linkText).text(default_value);
                    $(inputID).val(default_value);
                }
                else {
                    $(linkText).text(pseudo_default_value);
                    var textColor = $(linkText).parents('ul').css('background-color');
                    $(linkText).css('color', textColor);                   
                };
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
                var required = ($(this).attr("required") == "required" ? true : false) ;
                var newElement = new stretchyElement(index, $(this).attr('id'), "stretchy_input", $(this).attr("default_value") , required, $(this).val() );
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
    };
    
    var populateLinks = function( ) {
        for( var i=0; i<stretchyField.inputs.length; i++ ) {
            populateLink( stretchyField.inputs[i] );
        };
        for( var g=0; g<stretchyField.groups.length; g++ ) {
            populateLink( stretchyField.groups[g] );
        };		
    };
        

    var populateLink =  function( stretchyFieldElement ) {
        var link = $('#' + stretchyFieldElement.name + '_value');
        if(stretchyFieldElement.originalValue == null || stretchyFieldElement.originalValue == "") {
            if( stretchyFieldElement.defaultValue) {
                link.text(stretchyFieldElement.defaultValue);
            }
            else {
                link.text(stretchyFieldElement.pseudoDefaultValue); 
                var textColor = link.parents('ul').css('background-color');
                link.css('color', textColor);
            };
        }
        else { 
            link.text(stretchyFieldElement.originalValue); 
        };
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
    
    var finalizeStretchyGroups = function(groups) {
        if( groups.length > 0 ) {        
            $(groups).each(function(groupIndex) {
                hideOrShowGroupElements( groupIndex );
                setStyleAndText( groupIndex );
            });
        };
        return true;
    };
    
    var setStyleAndText = function( groupIndex ){
        var group = stretchyField.groups[groupIndex];
        var className = groupLinkStyleFor( group.name );
        $('#' + group.name + '_stretchy').addClass( className );
        var text = $('#' + group.name).attr( "default_value");
        if( text ){
            $('#' + group.name + '_value').text( text );
        }
        else {
            $('#' + group.name + '_value').text( '' );
        };
        return true;
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

    var hideOrShowGroupElements = function( groupIndex ) {
        var group = stretchyField.groups[groupIndex];
        var group_link = '#' + group.name + '_link';
        var group_input = '#' + group.name;
        if( elementsAreChanged(group.name) ){
            $(group_link).addClass('hidden_element');
            $(group_input).removeClass('hidden_element');
        }
        else {
            $(group_link).removeClass('hidden_element');
            $(group_input).addClass('hidden_element');
        };
    };

    var elementsAreChanged = function(groupName) {
        var changed = false;
        var group = findGroupByName( groupName );
        for( var e = group.firstElementIndex; e <= group.lastElementIndex; e++){
            var defaultValue = stretchyField.inputs[e].defaultValue ? stretchyField.inputs[e].defaultValue : stretchyField.inputs[e].pseudoDefaultValue ;
            var userInput = $('#' + stretchyField.inputs[e].name).val() ;
            if( userInput.length > 0 && defaultValue != $('#' + stretchyField.inputs[e].name).val() ) {
                changed = true;
                break;
            };
        };
        return changed;
    };

    var stretchyGroupLink = function(element) {
        var linkHtml;
        var groupName = $(element).attr('id');
        linkHtml = '<div id="' + groupName + '_stretchy">';
            linkHtml += '<div class="form_text_input" >';
                linkHtml += '<label for="Address" >Address </label>';
                linkHtml += '<div id="contact_address_link" class="" style="display:block" >';
                    linkHtml += '<ul><li><a id="' + groupName + '_value" class="stretchy_group" >';
                    linkHtml += "Pending";
                    linkHtml += '</a></li></ul>';
                linkHtml += '</div>';
            linkHtml += '</div>';
        linkHtml += '</div>';
        return linkHtml;
    };
    
    var groupLinkStyleFor = function( groupName ) {
        var group = findGroupByName( groupName );
        var linkStyle = "stretchy_link" ;
        for(var e = group.firstElementIndex; e <= group.lastElementIndex; e++) {
            if( stretchyField.inputs[e].isRequired == true ){
                linkStyle = "stretchy_box" ;
                break;
            };
        };
        return linkStyle;
    };

    var stretchyGroup = function(name, firstElementIndex, lastElementIndex) {
        this.name = name;
        this.firstElementIndex = firstElementIndex;
        this.lastElementIndex = lastElementIndex;
    };

    var stretchyElement = function(index, name, className, defaultValue, isRequired, originalValue) {
        this.index = index;
        this.name = name;
        this.className = className;
        this.defaultValue = defaultValue;
        this.isRequired = isRequired; 
        this.originalValue = originalValue;
    };
    
    var setPseudoDefaultValues = function( stretchyFieldElements ) {
        var inputs = stretchyFieldElements.inputs;
        var groups = stretchyFieldElements.groups;
        var holding = 0;
        for(var i=0; i<inputs.length; i++){
            setPseudoDefaultValue( inputs[i], 'input' );
        };
        for(var g=0; g<groups.length; g++){
            setPseudoDefaultValue( groups[g], 'group' );
        };		
    };
    
    var setPseudoDefaultValue = function( stretchyFieldElement, elementType ){
        var inheritedFontSize;
        var parentMinWidth;
        var linkText;
        var numberOfCharacters;
        var characterString = '.';
        
        linkText = '#' + stretchyFieldElement.name + '_value';
        inheritedFontSize = $(linkText + ':eq(0)').css('font-size');
        stretchyFieldElement.linkTextColor = $(linkText + ':eq(0)').css('color');
        parentMinWidth = $(linkText).parents('ul').css('min-width');
        numberOfCharacters = parseInt( parentMinWidth ) / parseInt( inheritedFontSize );
        for( c=1;c<numberOfCharacters; c++){
            characterString += '..';
        };
        if( !stretchyFieldElement.defaultValue ) { 
            stretchyFieldElement.pseudoDefaultValue =characterString ; 
        };			
    };
})( jQuery );