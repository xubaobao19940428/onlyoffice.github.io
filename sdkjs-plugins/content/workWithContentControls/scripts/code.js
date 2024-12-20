/**
 *
 * (c) Copyright Ascensio System SIA 2020
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
(function(window, undefined){

	//properties for content controls
	var _placeholderInsert_Replace = "[\r\n\
{\r\n\
	\"Props\" : \r\n\
	{\r\n\
		\"Id\" : 0,\r\n\
		\"Tag\" : \"{Document1}\",\r\n\
		\"Lock\" : 0,\r\n\
		\"Alias\" : \"TestAlias\",\r\n\
		\"Appearance\" : 2\r\n\
	},\r\n\
\r\n\
	\"Url\" : \"https://personal.onlyoffice.com/products/files/httphandlers/filehandler.ashx?action=view&fileid=4356181&version=0&doc=SUp1RjRQbFVOeExxTE9PZ1RwRUxMcWhpajZJL0MyblB6dU9lbEFaZmNCND0_NDM1NjE4MQ\",\r\n\
\r\n\
	\"Format\" : \"docx\"\r\n\
},\r\n\
{\r\n\
	\"Props\" : \r\n\
	{\r\n\
		\"Id\" : 1,\r\n\
		\"Tag\" : \"{Document2}\",\r\n\
		\"Lock\" : 1,\r\n\
		\"Appearance\" : 1,\r\n\
		\"Color\" : { \"R\" : 0, \"G\" : 255, \"B\" : 0 }\r\n\
	},\r\n\
\r\n\
	\"Url\" : \"https://personal.onlyoffice.com/products/files/httphandlers/filehandler.ashx?action=view&fileid=4356181&version=0&doc=SUp1RjRQbFVOeExxTE9PZ1RwRUxMcWhpajZJL0MyblB6dU9lbEFaZmNCND0_NDM1NjE4MQ\",\r\n\
\r\n\
	\"Format\" : \"docx\"\r\n\
},\r\n\
{\r\n\
	\"Props\" : \r\n\
	{\r\n\
		\"Id\" : 2,\r\n\
		\"Tag\" : \"{Document3}\",\r\n\
		\"Lock\" : 0\r\n\
	},\r\n\
\r\n\
	\"Script\" : \"var oDocument = Api.GetDocument();var oParagraph = Api.CreateParagraph();oParagraph.AddText(\'Hello world!\');oDocument.InsertContent([oParagraph]);\"\r\n\
},\r\n\
{\r\n\
	\"Props\" : \r\n\
	{\r\n\
		\"Id\" : 3,\r\n\
		\"Tag\" : \"{Document4}\",\r\n\
		\"Lock\" : 0\r\n\
	},\r\n\
\r\n\
	\"Url\" : \"https://personal.onlyoffice.com/products/files/httphandlers/filehandler.ashx?action=view&fileid=4356181&version=0&doc=SUp1RjRQbFVOeExxTE9PZ1RwRUxMcWhpajZJL0MyblB6dU9lbEFaZmNCND0_NDM1NjE4MQ\",\r\n\
\r\n\
	\"Format\" : \"docx\"\r\n\
},\r\n\
{\r\n\
	\"Props\" : \r\n\
	{\r\n\
		\"Id\" : 4,\r\n\
		\"Tag\" : \"{Document5}\",\r\n\
		\"Lock\" : 0,\r\n\
		\"Inline\" : true\r\n\
	},\r\n\
\r\n\
	\"Script\" : \"var oDocument = Api.GetDocument();var oParagraph = Api.CreateParagraph();oParagraph.AddText(\'Hello world!\');oDocument.InsertContent([oParagraph], true);\"\r\n\
}\r\n\
]";

	var _placeholderRemove = "[\r\n\
{\r\n\
	\"InternalId\" : \"\"\r\n\
}\r\n\
]";

	var _placeholderGetAll = "";

	String.prototype.replaceAll = function(search, replacement) {
		var target = this;
		return target.replace(new RegExp(search, 'g'), replacement);
	};

	var _Control = [];

    window.Asc.plugin.init = function(text)
    {
		document.getElementById("textareaIR").value = _placeholderInsert_Replace;
		document.getElementById("textareaR").value = _placeholderRemove;
		document.getElementById("textareaG").value = _placeholderGetAll;

    	document.getElementById("buttonIDInsertAndContext").onclick = function() {
			_Control = [];
    		var _val = document.getElementById("textareaIR").value;
			_val = _val.replaceAll("\r\n", "");
			_val = _val.replaceAll("\n", "");
			var _obj = JSON.parse(_val);
			for (var i = 0; i <_obj.length; i++) {
				if(_obj[i].Props.Inline) {
					_Control.push(_obj[i]);
					_obj.splice(i,1);
					i--;
				}
			}
			if (_obj.length) {
				//paste content control
				window.Asc.plugin.executeMethod("InsertAndReplaceContentControls", [_obj]);
			}
			if (_Control.length) {
				//paste inline content control
				PasteInlineContentControl();
			}
		};
		document.getElementById("buttonIDRemove").onclick = function() {

			var _val = document.getElementById("textareaR").value;
			_val = _val.replaceAll("\r\n", "");
			_val = _val.replaceAll("\n", "");
			var _obj = JSON.parse(_val);
			//remove content control by id 
			window.Asc.plugin.executeMethod("RemoveContentControls", [_obj]);

		};
		document.getElementById("buttonIDGetAll").onclick = function() {
			// get all content control
			window.Asc.plugin.executeMethod("GetAllContentControls");

		};
		document.getElementById("buttonIDChangeState").onclick = function() {

			_Control = [];
			window.buttonIDChangeState_click = true;
			//get current content control (where is the cursor located)
			window.Asc.plugin.executeMethod("GetCurrentContentControl");

		};
		document.getElementById("buttonIDCurrent").onclick = function() {

			//get current content control (where is the cursor located)
			window.Asc.plugin.executeMethod("GetCurrentContentControl");

		};
	};
	
	function PasteInlineContentControl () {
		for (var key in _Control) {
			//add inline content control
			window.Asc.plugin.executeMethod("AddContentControl", [2, {"Lock" : 3}]);
		}
	}

    window.Asc.plugin.button = function(id)
    {
		this.executeCommand("close", "");
    }; 

	window.Asc.plugin.onMethodReturn = function(returnValue)
	{
		//event return for completed methods
		var _plugin = window.Asc.plugin;
		if (_plugin.info.methodName == "AddContentControl" && returnValue)
		{
			if (_Control.length)
			{
				_Control[0].Props.InternalId = returnValue.InternalId;
				var _obj = _Control[0];
				window.Asc.plugin.executeMethod("InsertAndReplaceContentControls", [[_obj]]);
				_Control.splice(0,1);
			}
		} else if (_plugin.info.methodName == "GetAllContentControls")
		{
			document.getElementById("textareaG").value = "";

			var _val = JSON.stringify(returnValue);
			_val = _val.split("[").join("[\r\n");
			_val = _val.split(",").join(",\r\n");
			_val = _val.split("]").join("\r\n]");

			document.getElementById("textareaG").value = _val;
		}
		else if (window.buttonIDChangeState_click)
		{
			window.buttonIDChangeState_click = undefined;
			if (null == returnValue)
			{
				window.Asc.plugin.executeMethod("AddContentControl", [1/*1 - block, 2 - inline*/, {"Id" : 7/*own id*/, "Lock" : 0, "Tag" : "{some text}"}]);
			}
			else
			{
				window.Asc.plugin.executeMethod("RemoveContentControl", [returnValue]);
			}
		}
		else
		{
			console.log(returnValue);
		}
	};

})(window, undefined);