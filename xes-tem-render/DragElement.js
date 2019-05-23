'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DragElement = function () {
    function DragElement(element, callback) {
        (0, _classCallCheck3.default)(this, DragElement);

        this.element = element;
        this.canMove = false;
        this.Drag(callback);
    }

    (0, _createClass3.default)(DragElement, [{
        key: 'Drag',
        value: function Drag(callback) {
            var _that = this;
            _that.element.interactive = true;
            _that.element.cursor = 'pointer';
            _that.element.on('pointerdown', dragElementStart);
            _that.element.on('pointermove', dragElementMove);
            _that.element.on('pointerup', dragElementEnd);

            function dragElementStart(e) {
                var startPos = e.data.getLocalPosition(stage);
                _that.element.parent.setChildIndex(_that.element, _that.element.parent.children.length - 1);
                _that.element.offsetPosX = _that.element.x - startPos.x;
                _that.element.offsetPosY = _that.element.y - startPos.y;
                _that.canMove = true;
            }

            function dragElementMove(e) {
                var movePos = e.data.getLocalPosition(stage);
                if (_that.canMove && _that.element) {
                    if (movePos.x > 10 && movePos.x < 1910 && movePos.y > 10 && movePos.y < 1070) {
                        _that.element.x = movePos.x + _that.element.offsetPosX;
                        _that.element.y = movePos.y + _that.element.offsetPosY;

                        callback(_that.element.x, _that.element.y);
                    }
                }
            }

            function dragElementEnd(e) {
                _that.canMove = false;
                _that.element.offsetPosX = null;
                _that.element.offsetPosY = null;
            }
        }
    }]);
    return DragElement;
}();

exports.default = DragElement;