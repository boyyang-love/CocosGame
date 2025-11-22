'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HTMLGraphForgeElement = void 0;
const tslib_1 = require("tslib");
const graph_1 = require("./graph");
const utils_1 = require("./utils");
const event_1 = require("./event");
const structures_1 = require("@itharbors/structures");
const undo_1 = require("./undo");
const js_yaml_1 = tslib_1.__importDefault(require("js-yaml"));
const enum_1 = require("./enum");
const STYLE = /*css*/ `
:host { display: flex; flex-direction: column; }
:host > header { padding: 4px 10px; display: flex; }
:host > header > div { flex: 1; }
:host > header > div > span { cursor: pointer; }
:host > header > slot { display: block; }
:host > header > i { margin: 0 4px; }
:host > section { flex: 1; display: flex; }
:host > section > v-graph { flex: 1; }
`;
const HTML = /*html*/ `
<style>${STYLE}</style>
<header>
    <div></div>
    <slot></slot>
</header>
<section>
    <v-graph type=""><v-graph>
</section>
`;
class HTMLGraphForgeElement extends HTMLElement {
    constructor() {
        super();
        this.actionQueue = new structures_1.ActionQueue({
            forge: this,
        });
        this.paths = [];
        this.attachShadow({
            mode: 'open',
        });
        this.shadowRoot.innerHTML = HTML;
        this.$graph = this.shadowRoot.querySelector('v-graph');
        this._initHeader();
        this._initSection();
    }
    _initHeader() {
        this._updateHeader();
        this.shadowRoot.querySelector('header > div').addEventListener('click', (event) => {
            const $span = event.target;
            if (!$span.hasAttribute('path-index')) {
                return;
            }
            let index = parseInt($span.getAttribute('path-index') || '0');
            if (index < 0) {
                index = 0;
            }
            this.paths.splice(index + 1);
            this._updateGraph();
            const graph = this.paths[this.paths.length - 1];
            (0, utils_1.dispatch)(this, 'enter-graph', {
                detail: {
                    id: graph.name,
                },
            });
        });
    }
    _updateHeader() {
        const paths = this.paths.map((info, index) => `<span path-index="${index}">${info.name || info.type}</span>`).join('<i>/</i>');
        this.shadowRoot.querySelector('header > div').innerHTML = paths;
    }
    _initSection() {
        const $graph = this.shadowRoot.querySelector('v-graph');
        $graph.shadowRoot.addEventListener('block-click', (event) => {
            const customEvent = event;
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            const $node = customEvent.target;
            if (info.graph.event && info.graph.event.onBlockClick) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $node.getAttribute('node-uuid') || '';
                const block = $graph.getProperty('nodes')[uuid];
                const blockEvent = new event_1.BlockMouseEvent(nodes, lines, $node, block);
                info.graph.event.onBlockClick(blockEvent);
            }
        });
        $graph.shadowRoot.addEventListener('block-dblclick', (event) => {
            const customEvent = event;
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            const $node = customEvent.target;
            if ($node.tagName === 'V-GRAPH-NODE') {
                const details = $node.getProperty('details');
                if (details.subGraph) {
                    this.enterSubGraph(details.subGraph);
                    return;
                }
            }
            if (info.graph.event && info.graph.event.onBlockDblClick) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $node.getAttribute('node-uuid') || '';
                const block = $graph.getProperty('nodes')[uuid];
                const blockEvent = new event_1.BlockMouseEvent(nodes, lines, $node, block);
                blockEvent.initPagePosition(customEvent.detail.pageX, customEvent.detail.pageY);
                const graphPosition = $graph.convertCoordinate(customEvent.detail.offsetX, customEvent.detail.offsetY);
                blockEvent.initGraphPosition(graphPosition.x, graphPosition.y);
                info.graph.event.onBlockDblClick(blockEvent);
            }
        });
        $graph.shadowRoot.addEventListener('block-right-click', (event) => {
            const customEvent = event;
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            const $node = customEvent.target;
            if (info.graph.event && info.graph.event.onBlockRightClick) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $node.getAttribute('node-uuid') || '';
                const block = $graph.getProperty('nodes')[uuid];
                const blockEvent = new event_1.BlockMouseEvent(nodes, lines, $node, block);
                info.graph.event.onBlockRightClick(blockEvent);
            }
        });
        $graph.addEventListener('node-selected', (event) => {
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            const $node = event.target;
            if (info.graph.event && info.graph.event.onBlockSelected) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $node.getAttribute('node-uuid') || '';
                const block = $graph.getProperty('nodes')[uuid];
                const event = new event_1.BlockEvent(nodes, lines, $node, block);
                info.graph.event.onBlockSelected(event);
            }
        });
        $graph.addEventListener('node-unselected', (event) => {
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            const $node = event.target;
            if (info.graph.event && info.graph.event.onBlockUnselected) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $node.getAttribute('node-uuid') || '';
                const block = $graph.getProperty('nodes')[uuid];
                const event = new event_1.BlockEvent(nodes, lines, $node, block);
                info.graph.event.onBlockUnselected(event);
            }
        });
        $graph.addEventListener('line-selected', (event) => {
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            const $g = event.target;
            if (info.graph.event && info.graph.event.onLineSelected) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $g.getAttribute('line-uuid') || '';
                const line = lines[uuid];
                const event = new event_1.LineEvent(nodes, lines, $g, line);
                info.graph.event.onLineSelected(event);
            }
        });
        $graph.addEventListener('line-unselected', (event) => {
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            const $g = event.target;
            if (info.graph.event && info.graph.event.onLineUnselected) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $g.getAttribute('line-uuid') || '';
                const line = lines[uuid];
                const event = new event_1.LineEvent(nodes, lines, $g, line);
                info.graph.event.onLineUnselected(event);
            }
        });
        $graph.addEventListener('node-added', (event) => {
            const cEvent = event;
            (0, utils_1.dispatch)(this, 'node-added', {
                detail: cEvent.detail,
            });
            (0, utils_1.dispatch)(this, 'dirty');
        });
        $graph.addEventListener('node-removed', (event) => {
            const cEvent = event;
            (0, utils_1.dispatch)(this, 'node-removed', {
                detail: cEvent.detail,
            });
            (0, utils_1.dispatch)(this, 'dirty');
        });
        $graph.addEventListener('node-changed', (event) => {
            const cEvent = event;
            (0, utils_1.dispatch)(this, 'node-changed', {
                detail: cEvent.detail,
            });
            (0, utils_1.dispatch)(this, 'dirty');
        });
        $graph.addEventListener('node-position-changed', (event) => {
            const cEvent = event;
            const queue = cEvent.detail.moveList.map((item) => {
                return new undo_1.BlockPositionAction({
                    blockName: item.id,
                    target: item.target,
                    source: item.source,
                });
            });
            if (queue.length === 1) {
                this.actionQueue.exec(queue[0]);
            }
            else if (queue.length > 1) {
                this.actionQueue.exec(new structures_1.ActionList({
                    queue,
                }));
            }
            (0, utils_1.dispatch)(this, 'dirty', {
                detail: {
                    dirtyType: 'position-changed',
                },
            });
        });
        // //// ////
        $graph.shadowRoot.addEventListener('dirty', (event) => {
            const cEvent = event;
            if (cEvent.detail && cEvent.detail.action) {
                this.actionQueue.exec(cEvent.detail.action);
            }
            (0, utils_1.dispatch)(this, 'dirty', {
                detail: cEvent.detail,
            });
        });
        $graph.addEventListener('mouseup', (event) => {
            const info = graph_1.graphMap.get(this.rootGraph.type);
            if (!info) {
                return;
            }
            if (event.button === 2 && info.graph.event?.onGraphRightClick) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const graphPosition = $graph.convertCoordinate(event.offsetX, event.offsetY);
                const customEvent = new event_1.GraphMouseEvent(nodes, lines, $graph, this);
                customEvent.initPagePosition(event.pageX, event.pageY);
                customEvent.initGraphPosition(graphPosition.x, graphPosition.y);
                info.graph.event.onGraphRightClick(customEvent);
            }
        });
        $graph.addEventListener('line-added', (event) => {
            const customEment = event;
            const $node = $graph.queryNodeElement(customEment.detail.line.output.node);
            if ($node) {
                // @ts-ignore
                $node.onUpdate && $node.onUpdate();
            }
            (0, utils_1.dispatch)(this, 'line-added', {
                detail: customEment.detail,
            });
            (0, utils_1.dispatch)(this, 'dirty');
        });
        $graph.addEventListener('line-removed', (event) => {
            const customEment = event;
            const $node = $graph.queryNodeElement(customEment.detail.line.output.node);
            if ($node) {
                // @ts-ignore
                $node.onUpdate && $node.onUpdate();
            }
            (0, utils_1.dispatch)(this, 'line-removed', {
                detail: customEment.detail,
            });
            (0, utils_1.dispatch)(this, 'dirty');
        });
        $graph.addEventListener('line-changed', (event) => {
            const customElement = event;
            (0, utils_1.dispatch)(this, 'line-changed', {
                detail: customElement.detail,
            });
            (0, utils_1.dispatch)(this, 'dirty');
        });
        $graph.addEventListener('node-connected', (event) => {
            const customElement = event;
            this.startRecording();
            this.addLine(customElement.detail.line);
            setTimeout(() => {
                this.stopRecording();
            }, 200);
        });
        const $svg = $graph.shadowRoot.querySelector('#lines');
        function searchG(htmlArray) {
            if (!htmlArray)
                return;
            const length = Math.min(htmlArray.length, 4);
            for (let i = 0; i < length; i++) {
                const $elem = htmlArray[i];
                // 如果找到顶部的 document 元素的话，是没有 tagName 的
                if ($elem.tagName && $elem.tagName.toLocaleLowerCase() === 'g') {
                    return $elem;
                }
            }
        }
        $svg.addEventListener('dblclick', (event) => {
            // @ts-ignore
            const $g = searchG(event.path);
            if (!$g || !$g.hasAttribute('line-uuid')) {
                return;
            }
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            if (info.graph.event && info.graph.event.onLineDblClick) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $g.getAttribute('line-uuid') || '';
                const line = lines[uuid];
                const event = new event_1.LineMouseEvent(nodes, lines, $g, line);
                info.graph.event.onLineDblClick(event);
            }
        });
        $svg.addEventListener('click', (event) => {
            // @ts-ignore
            const $g = searchG(event.path);
            if (!$g || !$g.hasAttribute('line-uuid')) {
                return;
            }
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            if (info.graph.event && info.graph.event.onLineClick) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $g.getAttribute('line-uuid') || '';
                const line = lines[uuid];
                const event = new event_1.LineMouseEvent(nodes, lines, $g, line);
                info.graph.event.onLineClick(event);
            }
        });
        $svg.addEventListener('mouseup', (event) => {
            // @ts-ignore
            const $g = searchG(event.path);
            if (!$g || !$g.hasAttribute('line-uuid')) {
                return;
            }
            if (event.button !== 2) {
                return;
            }
            const type = this.paths[this.paths.length - 1].type;
            const info = graph_1.graphMap.get(type);
            if (!info) {
                return;
            }
            if (info.graph.event && info.graph.event.onLineRightClick) {
                const nodes = $graph.getProperty('nodes');
                const lines = $graph.getProperty('lines');
                const uuid = $g.getAttribute('line-uuid') || '';
                const line = lines[uuid];
                const event = new event_1.LineMouseEvent(nodes, lines, $g, line);
                info.graph.event.onLineRightClick(event);
            }
        });
    }
    _updateGraph() {
        (0, enum_1.clearDynamicEnum)();
        const graph = this.paths[this.paths.length - 1];
        const $graph = this.shadowRoot.querySelector('v-graph');
        $graph.clear();
        requestAnimationFrame(() => {
            $graph.setAttribute('type', graph.type);
            $graph.setProperty('lines', graph.lines);
            $graph.setProperty('nodes', graph.nodes);
            this._updateHeader();
        });
    }
    undo() {
        this.actionQueue.undo();
        (0, utils_1.dispatch)(this, 'undo');
    }
    redo() {
        this.actionQueue.redo();
        (0, utils_1.dispatch)(this, 'redo');
    }
    startRecording() {
        this.actionQueue.startRecording();
    }
    stopRecording() {
        this.actionQueue.stopRecording();
    }
    getPinElement(blockName, type, index) {
        const $block = this.$graph.shadowRoot.querySelector(`v-graph-node[node-uuid=${blockName}]`);
        if (!$block) {
            return;
        }
        const $pinList = $block.shadowRoot.querySelectorAll(`.pin.in`);
        const $pin = $pinList[index];
        return $pin;
    }
    getBlockElement(blockName) {
        return this.$graph.shadowRoot.querySelector(`v-graph-node[node-uuid=${blockName}]`);
    }
    /// ---- 操作整个图
    /**
     * 将屏幕坐标转换成 Graph 内的坐标
     * @param point
     * @returns
     */
    convertCoordinate(point) {
        point = this.$graph.convertCoordinate(point.x, point.y);
        return point;
    }
    /**
     * 设置编辑的根图
     * @param graph
     */
    setRootGraph(graph) {
        this.rootGraph = graph;
        this.paths = [graph];
        this._updateGraph();
    }
    /**
     * 获取正在编辑的根图
     * @returns
     */
    getRootGraph() {
        return this.paths[0];
    }
    /**
     * 传入一个字符串，反序列化成图数据
     * @param content
     * @returns
     */
    deserialize(content) {
        const graphData = js_yaml_1.default.load(content);
        return graphData;
    }
    /**
     * 传入一个图数据，序列化成 yaml 字符串
     * @param data
     * @returns
     */
    serialize(data) {
        const str = js_yaml_1.default.dump(data || this.paths[0]);
        // return JSON.stringify(this.paths[0]);
        // outputFileSync('/Users/wangsijie/Project/Creator/cocos-editor/extension-repos/shader-graph/test.yaml', str);
        return str;
    }
    /**
     * 获取整个图现在的一些基础数据
     * @returns
     */
    getGraphInfo() {
        const offset = this.$graph.getProperty('offset');
        const scale = this.$graph.getProperty('scale');
        return {
            offset, scale,
        };
    }
    /**
     * 设置整个图的一些基础数据
     * @param info
     */
    setGraphInfo(info) {
        this.$graph.setProperty('offset', info.offset);
        this.$graph.setProperty('scale', info.scale);
    }
    /**
     * 恢复缩放比例
     */
    zoomToFit() {
        this.$graph.data.setProperty('scale', 1);
    }
    /// ---- 操作当前图
    /**
     * 获取选中的 Block 列表
     * @returns
     */
    getSelectedBlockList() {
        return this.$graph.getSelectedNodeList();
    }
    /**
     * 获取选中的 Line 列表
     * @returns
     */
    getSelectedLineList() {
        return this.$graph.getSelectedLineList();
    }
    /**
     * 设置当前正在编辑的图数据
     * @param graph
     * @returns
     */
    setCurrentGraph(graph) {
        if (this.paths.length <= 1) {
            this.setRootGraph(graph);
            return;
        }
        this.paths[this.paths.length - 1] = graph;
        this._updateGraph();
    }
    /**
     * 获取正在编辑的图数据
     * @returns
     */
    getCurrentGraph() {
        return this.paths[this.paths.length - 1];
    }
    /**
     * 在当前正在操作的图数据里增加一个 Block
     * @param block
     * @param id
     */
    addBlock(block, id) {
        this.actionQueue.exec(new undo_1.AddBlockAction({ block, id }));
    }
    /**
     * 在当前正在操作的图数据里删除一个节点
     * @param id
     */
    removeBlock(id) {
        const queue = [];
        // remove line
        const lines = this.$graph.getProperty('lines');
        for (const key in lines) {
            const line = lines[key];
            if (line.input.node === id || line.output.node === id) {
                queue.push(new undo_1.RemoveLineAction({ id: key }));
            }
        }
        queue.push(new undo_1.RemoveBlockAction({ id }));
        this.actionQueue.exec(new structures_1.ActionList({
            queue,
        }));
    }
    /**
     * 在当前正在操作的图数据里增加一个连线
     * @param line
     * @param id
     */
    addLine(line, id) {
        this.actionQueue.exec(new undo_1.AddLineAction({ line, id }));
    }
    /**
     * 在当前正在操作的图数据里删除一个连线
     * @param id
     */
    removeLine(id) {
        this.actionQueue.exec(new undo_1.RemoveLineAction({ id }));
    }
    /**
     * 进入当前图的子图
     * @param id
     */
    enterSubGraph(id) {
        const graph = this.paths[this.paths.length - 1];
        const subGraph = graph.graphs[id];
        if (subGraph) {
            this.paths.push(subGraph);
            this._updateGraph();
        }
        (0, utils_1.dispatch)(this, 'enter-graph', {
            detail: {
                id: id,
            },
        });
    }
    /**
     * 在当前编辑的图里增加一个子图
     * @param type
     * @param id
     * @returns
     */
    addSubGraph(type, id) {
        const info = this.paths[this.paths.length - 1];
        // const uuid = generateUUID();
        info.graphs[id] = {
            type,
            name: type,
            nodes: {},
            lines: {},
            graphs: {},
        };
        return info.graphs[id];
    }
    /**
     * 在当前编辑的图里，删除一个子图
     * @param id
     */
    removeSubGraph(id) {
        const info = this.paths[this.paths.length - 1];
        delete info.graphs[id];
    }
}
exports.HTMLGraphForgeElement = HTMLGraphForgeElement;
if (!window.customElements.get('ui-graph-forge')) {
    window.customElements.define('ui-graph-forge', HTMLGraphForgeElement);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9yZ2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmxvY2stZm9yZ2UvZm9yZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFDOzs7O0FBVWIsbUNBQW1DO0FBQ25DLG1DQUFpRDtBQUNqRCxtQ0FBa0c7QUFFbEcsc0RBSStCO0FBRS9CLGlDQU1nQjtBQUloQiw4REFBMkI7QUFDM0IsaUNBQTBDO0FBRTFDLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQTs7Ozs7Ozs7O0NBU3BCLENBQUM7QUFFRixNQUFNLElBQUksR0FBRyxRQUFRLENBQUE7U0FDWixLQUFLOzs7Ozs7OztDQVFiLENBQUM7QUFFRixNQUFhLHFCQUFzQixTQUFRLFdBQVc7SUFRbEQ7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQVBKLGdCQUFXLEdBQUcsSUFBSSx3QkFBVyxDQUFDO1lBQ2xDLEtBQUssRUFBRSxJQUFJO1NBQ2QsQ0FBQyxDQUFDO1FBbUJILFVBQUssR0FBZ0IsRUFBRSxDQUFDO1FBYnBCLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDZCxJQUFJLEVBQUUsTUFBTTtTQUNmLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxVQUFXLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUVsQyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFXLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBa0IsQ0FBQztRQUV6RSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDbkIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFLTyxXQUFXO1FBQ2YsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxVQUFXLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBRSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ2hGLE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFxQixD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SSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsY0FBYyxDQUFDLEVBQVU7UUFDckIsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQztRQUMvQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDM0IsQ0FBQztDQUNKO0FBem5CRCxzREF5bkJDO0FBRUQsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7SUFDOUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUscUJBQXFCLENBQUMsQ0FBQztDQUN6RSIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHR5cGUge1xuICAgIEdyYXBoRWxlbWVudCxcbiAgICBOb2RlQ2hhbmdlZERldGFpbCxcbiAgICBOb2RlUG9zaXRpb25DaGFuZ2VkRGV0YWlsLFxuICAgIEdyYXBoTm9kZUVsZW1lbnQsXG59IGZyb20gJ0BpdGhhcmJvcnMvdWktZ3JhcGgnO1xuXG5pbXBvcnQgdHlwZSB7IERpcnR5RGV0YWlsIH0gZnJvbSAnLi9waW4nO1xuaW1wb3J0IHsgZ3JhcGhNYXAgfSBmcm9tICcuL2dyYXBoJztcbmltcG9ydCB7IGdlbmVyYXRlVVVJRCwgZGlzcGF0Y2ggfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IEdyYXBoTW91c2VFdmVudCwgQmxvY2tNb3VzZUV2ZW50LCBCbG9ja0V2ZW50LCBMaW5lRXZlbnQsIExpbmVNb3VzZUV2ZW50IH0gZnJvbSAnLi9ldmVudCc7XG5cbmltcG9ydCB7XG4gICAgQWN0aW9uLFxuICAgIEFjdGlvbkxpc3QsXG4gICAgQWN0aW9uUXVldWUsXG59IGZyb20gJ0BpdGhhcmJvcnMvc3RydWN0dXJlcyc7XG5cbmltcG9ydCB7XG4gICAgQWRkQmxvY2tBY3Rpb24sXG4gICAgUmVtb3ZlQmxvY2tBY3Rpb24sXG4gICAgQWRkTGluZUFjdGlvbixcbiAgICBSZW1vdmVMaW5lQWN0aW9uLFxuICAgIEJsb2NrUG9zaXRpb25BY3Rpb24sXG59IGZyb20gJy4vdW5kbyc7XG5cbmltcG9ydCB0eXBlIHsgR3JhcGhEYXRhLCBCbG9ja0RhdGEsIExpbmVEYXRhLCBJR3JhcGhEZWZpbmVFdmVudCB9IGZyb20gJy4vaW50ZXJmYWNlJztcblxuaW1wb3J0IHlhbWwgZnJvbSAnanMteWFtbCc7XG5pbXBvcnQgeyBjbGVhckR5bmFtaWNFbnVtIH0gZnJvbSAnLi9lbnVtJztcblxuY29uc3QgU1RZTEUgPSAvKmNzcyovYFxuOmhvc3QgeyBkaXNwbGF5OiBmbGV4OyBmbGV4LWRpcmVjdGlvbjogY29sdW1uOyB9XG46aG9zdCA+IGhlYWRlciB7IHBhZGRpbmc6IDRweCAxMHB4OyBkaXNwbGF5OiBmbGV4OyB9XG46aG9zdCA+IGhlYWRlciA+IGRpdiB7IGZsZXg6IDE7IH1cbjpob3N0ID4gaGVhZGVyID4gZGl2ID4gc3BhbiB7IGN1cnNvcjogcG9pbnRlcjsgfVxuOmhvc3QgPiBoZWFkZXIgPiBzbG90IHsgZGlzcGxheTogYmxvY2s7IH1cbjpob3N0ID4gaGVhZGVyID4gaSB7IG1hcmdpbjogMCA0cHg7IH1cbjpob3N0ID4gc2VjdGlvbiB7IGZsZXg6IDE7IGRpc3BsYXk6IGZsZXg7IH1cbjpob3N0ID4gc2VjdGlvbiA+IHYtZ3JhcGggeyBmbGV4OiAxOyB9XG5gO1xuXG5jb25zdCBIVE1MID0gLypodG1sKi9gXG48c3R5bGU+JHtTVFlMRX08L3N0eWxlPlxuPGhlYWRlcj5cbiAgICA8ZGl2PjwvZGl2PlxuICAgIDxzbG90Pjwvc2xvdD5cbjwvaGVhZGVyPlxuPHNlY3Rpb24+XG4gICAgPHYtZ3JhcGggdHlwZT1cIlwiPjx2LWdyYXBoPlxuPC9zZWN0aW9uPlxuYDtcblxuZXhwb3J0IGNsYXNzIEhUTUxHcmFwaEZvcmdlRWxlbWVudCBleHRlbmRzIEhUTUxFbGVtZW50IHtcblxuICAgIHByaXZhdGUgYWN0aW9uUXVldWUgPSBuZXcgQWN0aW9uUXVldWUoe1xuICAgICAgICBmb3JnZTogdGhpcyxcbiAgICB9KTtcblxuICAgICRncmFwaDogR3JhcGhFbGVtZW50O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYXR0YWNoU2hhZG93KHtcbiAgICAgICAgICAgIG1vZGU6ICdvcGVuJyxcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zaGFkb3dSb290IS5pbm5lckhUTUwgPSBIVE1MO1xuXG4gICAgICAgIHRoaXMuJGdyYXBoID0gdGhpcy5zaGFkb3dSb290IS5xdWVyeVNlbGVjdG9yKCd2LWdyYXBoJykhIGFzIEdyYXBoRWxlbWVudDtcblxuICAgICAgICB0aGlzLl9pbml0SGVhZGVyKCk7XG4gICAgICAgIHRoaXMuX2luaXRTZWN0aW9uKCk7XG4gICAgfVxuXG4gICAgcm9vdEdyYXBoPzogR3JhcGhEYXRhO1xuICAgIHBhdGhzOiBHcmFwaERhdGFbXSA9IFtdO1xuXG4gICAgcHJpdmF0ZSBfaW5pdEhlYWRlcigpIHtcbiAgICAgICAgdGhpcy5fdXBkYXRlSGVhZGVyKCk7XG4gICAgICAgIHRoaXMuc2hhZG93Um9vdCEucXVlcnlTZWxlY3RvcignaGVhZGVyID4gZGl2JykhLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCAkc3BhbiA9IGV2ZW50LnRhcmdldCBhcyBIVE1MRWxlbWVudDtcbiAgICAgICAgICAgIGlmICghJHNwYW4uaGFzQXR0cmlidXRlKCdwYXRoLWluZGV4JykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBwYXJzZUludCgkc3Bhbi5nZXRBdHRyaWJ1dGUoJ3BhdGgtaW5kZXgnKSB8fCAnMCcpO1xuICAgICAgICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucGF0aHMuc3BsaWNlKGluZGV4ICsgMSk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVHcmFwaCgpO1xuICAgICAgICAgICAgY29uc3QgZ3JhcGggPSB0aGlzLnBhdGhzW3RoaXMucGF0aHMubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICBkaXNwYXRjaCh0aGlzLCAnZW50ZXItZ3JhcGgnLCB7XG4gICAgICAgICAgICAgICAgZGV0YWlsOiB7XG4gICAgICAgICAgICAgICAgICAgIGlkOiBncmFwaC5uYW1lLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfdXBkYXRlSGVhZGVyKCkge1xuICAgICAgICBjb25zdCBwYXRocyA9IHRoaXMucGF0aHMubWFwKChpbmZvLCBpbmRleCkgPT4gYDxzcGFuIHBhdGgtaW5kZXg9XCIke2luZGV4fVwiPiR7aW5mby5uYW1lIHx8IGluZm8udHlwZX08L3NwYW4+YCkuam9pbignPGk+LzwvaT4nKTtcbiAgICAgICAgdGhpcy5zaGFkb3dSb290IS5xdWVyeVNlbGVjdG9yKCdoZWFkZXIgPiBkaXYnKSEuaW5uZXJIVE1MID0gcGF0aHM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfaW5pdFNlY3Rpb24oKSB7XG4gICAgICAgIGNvbnN0ICRncmFwaCA9IHRoaXMuc2hhZG93Um9vdCEucXVlcnlTZWxlY3Rvcigndi1ncmFwaCcpIGFzIEdyYXBoRWxlbWVudDtcbiAgICAgICAgJGdyYXBoLnNoYWRvd1Jvb3QhLmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrLWNsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21FdmVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50PHtcbiAgICAgICAgICAgIH0+O1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMucGF0aHNbdGhpcy5wYXRocy5sZW5ndGggLSAxXS50eXBlO1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGdyYXBoTWFwLmdldCh0eXBlKTtcbiAgICAgICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0ICRub2RlID0gY3VzdG9tRXZlbnQudGFyZ2V0IGFzIEdyYXBoTm9kZUVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoaW5mby5ncmFwaC5ldmVudCAmJiBpbmZvLmdyYXBoLmV2ZW50Lm9uQmxvY2tDbGljaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gJGdyYXBoLmdldFByb3BlcnR5KCdub2RlcycpIGFzIHsgW3V1aWQ6IHN0cmluZ106IEJsb2NrRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lcyA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbGluZXMnKSBhcyB7IFt1dWlkOiBzdHJpbmddOiBMaW5lRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gJG5vZGUuZ2V0QXR0cmlidXRlKCdub2RlLXV1aWQnKSB8fCAnJztcbiAgICAgICAgICAgICAgICBjb25zdCBibG9jayA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbm9kZXMnKVt1dWlkXSBhcyBCbG9ja0RhdGE7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2tFdmVudCA9IG5ldyBCbG9ja01vdXNlRXZlbnQobm9kZXMsIGxpbmVzLCAkbm9kZSwgYmxvY2spO1xuICAgICAgICAgICAgICAgIGluZm8uZ3JhcGguZXZlbnQub25CbG9ja0NsaWNrKGJsb2NrRXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJGdyYXBoLnNoYWRvd1Jvb3QhLmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrLWRibGNsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21FdmVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50PHtcbiAgICAgICAgICAgICAgICBwYWdlWDogbnVtYmVyO1xuICAgICAgICAgICAgICAgIHBhZ2VZOiBudW1iZXI7XG4gICAgICAgICAgICAgICAgb2Zmc2V0WDogbnVtYmVyO1xuICAgICAgICAgICAgICAgIG9mZnNldFk6IG51bWJlcjtcbiAgICAgICAgICAgIH0+O1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMucGF0aHNbdGhpcy5wYXRocy5sZW5ndGggLSAxXS50eXBlO1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGdyYXBoTWFwLmdldCh0eXBlKTtcbiAgICAgICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0ICRub2RlID0gY3VzdG9tRXZlbnQudGFyZ2V0IGFzIEdyYXBoTm9kZUVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoJG5vZGUudGFnTmFtZSA9PT0gJ1YtR1JBUEgtTk9ERScpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkZXRhaWxzID0gJG5vZGUuZ2V0UHJvcGVydHkoJ2RldGFpbHMnKTtcbiAgICAgICAgICAgICAgICBpZiAoZGV0YWlscy5zdWJHcmFwaCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVudGVyU3ViR3JhcGgoZGV0YWlscy5zdWJHcmFwaCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5mby5ncmFwaC5ldmVudCAmJiBpbmZvLmdyYXBoLmV2ZW50Lm9uQmxvY2tEYmxDbGljaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gJGdyYXBoLmdldFByb3BlcnR5KCdub2RlcycpIGFzIHsgW3V1aWQ6IHN0cmluZ106IEJsb2NrRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lcyA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbGluZXMnKSBhcyB7IFt1dWlkOiBzdHJpbmddOiBMaW5lRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gJG5vZGUuZ2V0QXR0cmlidXRlKCdub2RlLXV1aWQnKSB8fCAnJztcbiAgICAgICAgICAgICAgICBjb25zdCBibG9jayA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbm9kZXMnKVt1dWlkXSBhcyBCbG9ja0RhdGE7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2tFdmVudCA9IG5ldyBCbG9ja01vdXNlRXZlbnQobm9kZXMsIGxpbmVzLCAkbm9kZSwgYmxvY2spO1xuICAgICAgICAgICAgICAgIGJsb2NrRXZlbnQuaW5pdFBhZ2VQb3NpdGlvbihjdXN0b21FdmVudC5kZXRhaWwucGFnZVgsIGN1c3RvbUV2ZW50LmRldGFpbC5wYWdlWSk7XG4gICAgICAgICAgICAgICAgY29uc3QgZ3JhcGhQb3NpdGlvbiA9ICRncmFwaC5jb252ZXJ0Q29vcmRpbmF0ZShjdXN0b21FdmVudC5kZXRhaWwub2Zmc2V0WCwgY3VzdG9tRXZlbnQuZGV0YWlsLm9mZnNldFkpO1xuICAgICAgICAgICAgICAgIGJsb2NrRXZlbnQuaW5pdEdyYXBoUG9zaXRpb24oZ3JhcGhQb3NpdGlvbi54LCBncmFwaFBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIGluZm8uZ3JhcGguZXZlbnQub25CbG9ja0RibENsaWNrKGJsb2NrRXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJGdyYXBoLnNoYWRvd1Jvb3QhLmFkZEV2ZW50TGlzdGVuZXIoJ2Jsb2NrLXJpZ2h0LWNsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21FdmVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50PHtcbiAgICAgICAgICAgIH0+O1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMucGF0aHNbdGhpcy5wYXRocy5sZW5ndGggLSAxXS50eXBlO1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGdyYXBoTWFwLmdldCh0eXBlKTtcbiAgICAgICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0ICRub2RlID0gY3VzdG9tRXZlbnQudGFyZ2V0IGFzIEdyYXBoTm9kZUVsZW1lbnQ7XG4gICAgICAgICAgICBpZiAoaW5mby5ncmFwaC5ldmVudCAmJiBpbmZvLmdyYXBoLmV2ZW50Lm9uQmxvY2tSaWdodENsaWNrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSAkZ3JhcGguZ2V0UHJvcGVydHkoJ25vZGVzJykgYXMgeyBbdXVpZDogc3RyaW5nXTogQmxvY2tEYXRhOyB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gJGdyYXBoLmdldFByb3BlcnR5KCdsaW5lcycpIGFzIHsgW3V1aWQ6IHN0cmluZ106IExpbmVEYXRhOyB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSAkbm9kZS5nZXRBdHRyaWJ1dGUoJ25vZGUtdXVpZCcpIHx8ICcnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGJsb2NrID0gJGdyYXBoLmdldFByb3BlcnR5KCdub2RlcycpW3V1aWRdIGFzIEJsb2NrRGF0YTtcbiAgICAgICAgICAgICAgICBjb25zdCBibG9ja0V2ZW50ID0gbmV3IEJsb2NrTW91c2VFdmVudChub2RlcywgbGluZXMsICRub2RlLCBibG9jayk7XG4gICAgICAgICAgICAgICAgaW5mby5ncmFwaC5ldmVudC5vbkJsb2NrUmlnaHRDbGljayhibG9ja0V2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGdyYXBoLmFkZEV2ZW50TGlzdGVuZXIoJ25vZGUtc2VsZWN0ZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLnBhdGhzW3RoaXMucGF0aHMubGVuZ3RoIC0gMV0udHlwZTtcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBncmFwaE1hcC5nZXQodHlwZSk7XG4gICAgICAgICAgICBpZiAoIWluZm8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCAkbm9kZSA9IGV2ZW50LnRhcmdldCBhcyBHcmFwaE5vZGVFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGluZm8uZ3JhcGguZXZlbnQgJiYgaW5mby5ncmFwaC5ldmVudC5vbkJsb2NrU2VsZWN0ZWQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlcyA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbm9kZXMnKSBhcyB7IFt1dWlkOiBzdHJpbmddOiBCbG9ja0RhdGE7IH07XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSAkZ3JhcGguZ2V0UHJvcGVydHkoJ2xpbmVzJykgYXMgeyBbdXVpZDogc3RyaW5nXTogTGluZURhdGE7IH07XG4gICAgICAgICAgICAgICAgY29uc3QgdXVpZCA9ICRub2RlLmdldEF0dHJpYnV0ZSgnbm9kZS11dWlkJykgfHwgJyc7XG4gICAgICAgICAgICAgICAgY29uc3QgYmxvY2sgPSAkZ3JhcGguZ2V0UHJvcGVydHkoJ25vZGVzJylbdXVpZF0gYXMgQmxvY2tEYXRhO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IEJsb2NrRXZlbnQobm9kZXMsIGxpbmVzLCAkbm9kZSwgYmxvY2spO1xuICAgICAgICAgICAgICAgIGluZm8uZ3JhcGguZXZlbnQub25CbG9ja1NlbGVjdGVkKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgICRncmFwaC5hZGRFdmVudExpc3RlbmVyKCdub2RlLXVuc2VsZWN0ZWQnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLnBhdGhzW3RoaXMucGF0aHMubGVuZ3RoIC0gMV0udHlwZTtcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBncmFwaE1hcC5nZXQodHlwZSk7XG4gICAgICAgICAgICBpZiAoIWluZm8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCAkbm9kZSA9IGV2ZW50LnRhcmdldCBhcyBHcmFwaE5vZGVFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGluZm8uZ3JhcGguZXZlbnQgJiYgaW5mby5ncmFwaC5ldmVudC5vbkJsb2NrVW5zZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gJGdyYXBoLmdldFByb3BlcnR5KCdub2RlcycpIGFzIHsgW3V1aWQ6IHN0cmluZ106IEJsb2NrRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lcyA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbGluZXMnKSBhcyB7IFt1dWlkOiBzdHJpbmddOiBMaW5lRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gJG5vZGUuZ2V0QXR0cmlidXRlKCdub2RlLXV1aWQnKSB8fCAnJztcbiAgICAgICAgICAgICAgICBjb25zdCBibG9jayA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbm9kZXMnKVt1dWlkXSBhcyBCbG9ja0RhdGE7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgQmxvY2tFdmVudChub2RlcywgbGluZXMsICRub2RlLCBibG9jayk7XG4gICAgICAgICAgICAgICAgaW5mby5ncmFwaC5ldmVudC5vbkJsb2NrVW5zZWxlY3RlZChldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkZ3JhcGguYWRkRXZlbnRMaXN0ZW5lcignbGluZS1zZWxlY3RlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMucGF0aHNbdGhpcy5wYXRocy5sZW5ndGggLSAxXS50eXBlO1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGdyYXBoTWFwLmdldCh0eXBlKTtcbiAgICAgICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0ICRnID0gZXZlbnQudGFyZ2V0IGFzIFNWR0dFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGluZm8uZ3JhcGguZXZlbnQgJiYgaW5mby5ncmFwaC5ldmVudC5vbkxpbmVTZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gJGdyYXBoLmdldFByb3BlcnR5KCdub2RlcycpIGFzIHsgW3V1aWQ6IHN0cmluZ106IEJsb2NrRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lcyA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbGluZXMnKSBhcyB7IFt1dWlkOiBzdHJpbmddOiBMaW5lRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gJGcuZ2V0QXR0cmlidXRlKCdsaW5lLXV1aWQnKSB8fCAnJztcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lID0gbGluZXNbdXVpZF0gYXMgTGluZURhdGE7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgTGluZUV2ZW50KG5vZGVzLCBsaW5lcywgJGcsIGxpbmUpO1xuICAgICAgICAgICAgICAgIGluZm8uZ3JhcGguZXZlbnQub25MaW5lU2VsZWN0ZWQoZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJGdyYXBoLmFkZEV2ZW50TGlzdGVuZXIoJ2xpbmUtdW5zZWxlY3RlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMucGF0aHNbdGhpcy5wYXRocy5sZW5ndGggLSAxXS50eXBlO1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGdyYXBoTWFwLmdldCh0eXBlKTtcbiAgICAgICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0ICRnID0gZXZlbnQudGFyZ2V0IGFzIFNWR0dFbGVtZW50O1xuICAgICAgICAgICAgaWYgKGluZm8uZ3JhcGguZXZlbnQgJiYgaW5mby5ncmFwaC5ldmVudC5vbkxpbmVVbnNlbGVjdGVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSAkZ3JhcGguZ2V0UHJvcGVydHkoJ25vZGVzJykgYXMgeyBbdXVpZDogc3RyaW5nXTogQmxvY2tEYXRhOyB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gJGdyYXBoLmdldFByb3BlcnR5KCdsaW5lcycpIGFzIHsgW3V1aWQ6IHN0cmluZ106IExpbmVEYXRhOyB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHV1aWQgPSAkZy5nZXRBdHRyaWJ1dGUoJ2xpbmUtdXVpZCcpIHx8ICcnO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmUgPSBsaW5lc1t1dWlkXSBhcyBMaW5lRGF0YTtcbiAgICAgICAgICAgICAgICBjb25zdCBldmVudCA9IG5ldyBMaW5lRXZlbnQobm9kZXMsIGxpbmVzLCAkZywgbGluZSk7XG4gICAgICAgICAgICAgICAgaW5mby5ncmFwaC5ldmVudC5vbkxpbmVVbnNlbGVjdGVkKGV2ZW50KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgICRncmFwaC5hZGRFdmVudExpc3RlbmVyKCdub2RlLWFkZGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjRXZlbnQgPSBldmVudCBhcyBDdXN0b21FdmVudDxOb2RlQ2hhbmdlZERldGFpbD47XG4gICAgICAgICAgICBkaXNwYXRjaCh0aGlzLCAnbm9kZS1hZGRlZCcsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWw6IGNFdmVudC5kZXRhaWwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRpc3BhdGNoKHRoaXMsICdkaXJ0eScpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGdyYXBoLmFkZEV2ZW50TGlzdGVuZXIoJ25vZGUtcmVtb3ZlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY0V2ZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ8Tm9kZUNoYW5nZWREZXRhaWw+O1xuICAgICAgICAgICAgZGlzcGF0Y2godGhpcywgJ25vZGUtcmVtb3ZlZCcsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWw6IGNFdmVudC5kZXRhaWwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRpc3BhdGNoKHRoaXMsICdkaXJ0eScpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGdyYXBoLmFkZEV2ZW50TGlzdGVuZXIoJ25vZGUtY2hhbmdlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY0V2ZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ8Tm9kZUNoYW5nZWREZXRhaWw+O1xuICAgICAgICAgICAgZGlzcGF0Y2godGhpcywgJ25vZGUtY2hhbmdlZCcsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWw6IGNFdmVudC5kZXRhaWwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRpc3BhdGNoKHRoaXMsICdkaXJ0eScpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGdyYXBoLmFkZEV2ZW50TGlzdGVuZXIoJ25vZGUtcG9zaXRpb24tY2hhbmdlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY0V2ZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ8Tm9kZVBvc2l0aW9uQ2hhbmdlZERldGFpbD47XG4gICAgICAgICAgICBjb25zdCBxdWV1ZSA9IGNFdmVudC5kZXRhaWwubW92ZUxpc3QubWFwKChpdGVtKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCbG9ja1Bvc2l0aW9uQWN0aW9uKHtcbiAgICAgICAgICAgICAgICAgICAgYmxvY2tOYW1lOiBpdGVtLmlkLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGl0ZW0udGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICBzb3VyY2U6IGl0ZW0uc291cmNlLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3Rpb25RdWV1ZS5leGVjKHF1ZXVlWzBdKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocXVldWUubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9uUXVldWUuZXhlYyhuZXcgQWN0aW9uTGlzdCh7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLFxuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpc3BhdGNoKHRoaXMsICdkaXJ0eScsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWw6IHtcbiAgICAgICAgICAgICAgICAgICAgZGlydHlUeXBlOiAncG9zaXRpb24tY2hhbmdlZCcsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgLy8gLy8vLyAvLy8vXG4gICAgICAgICRncmFwaC5zaGFkb3dSb290LmFkZEV2ZW50TGlzdGVuZXIoJ2RpcnR5JywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjRXZlbnQgPSBldmVudCBhcyBDdXN0b21FdmVudDxEaXJ0eURldGFpbD47XG4gICAgICAgICAgICBpZiAoY0V2ZW50LmRldGFpbCAmJiBjRXZlbnQuZGV0YWlsLmFjdGlvbikge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW9uUXVldWUuZXhlYyhjRXZlbnQuZGV0YWlsLmFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXNwYXRjaCh0aGlzLCAnZGlydHknLCB7XG4gICAgICAgICAgICAgICAgZGV0YWlsOiBjRXZlbnQuZGV0YWlsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRncmFwaC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbmZvID0gZ3JhcGhNYXAuZ2V0KHRoaXMucm9vdEdyYXBoIS50eXBlKTtcbiAgICAgICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgoZXZlbnQgYXMgTW91c2VFdmVudCkuYnV0dG9uID09PSAyICYmIGluZm8uZ3JhcGguZXZlbnQ/Lm9uR3JhcGhSaWdodENsaWNrKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSAkZ3JhcGguZ2V0UHJvcGVydHkoJ25vZGVzJykgYXMgeyBbdXVpZDogc3RyaW5nXTogQmxvY2tEYXRhOyB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gJGdyYXBoLmdldFByb3BlcnR5KCdsaW5lcycpIGFzIHsgW3V1aWQ6IHN0cmluZ106IExpbmVEYXRhOyB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IGdyYXBoUG9zaXRpb24gPSAkZ3JhcGguY29udmVydENvb3JkaW5hdGUoZXZlbnQub2Zmc2V0WCwgZXZlbnQub2Zmc2V0WSk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VzdG9tRXZlbnQgPSBuZXcgR3JhcGhNb3VzZUV2ZW50KG5vZGVzLCBsaW5lcywgJGdyYXBoLCB0aGlzKTtcbiAgICAgICAgICAgICAgICBjdXN0b21FdmVudC5pbml0UGFnZVBvc2l0aW9uKGV2ZW50LnBhZ2VYLCBldmVudC5wYWdlWSk7XG4gICAgICAgICAgICAgICAgY3VzdG9tRXZlbnQuaW5pdEdyYXBoUG9zaXRpb24oZ3JhcGhQb3NpdGlvbi54LCBncmFwaFBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgICAgIGluZm8uZ3JhcGguZXZlbnQub25HcmFwaFJpZ2h0Q2xpY2soY3VzdG9tRXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkZ3JhcGguYWRkRXZlbnRMaXN0ZW5lcignbGluZS1hZGRlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3VzdG9tRW1lbnQgPSBldmVudCBhcyBDdXN0b21FdmVudDx7bGluZTogTGluZURhdGF9PjtcbiAgICAgICAgICAgIGNvbnN0ICRub2RlID0gJGdyYXBoLnF1ZXJ5Tm9kZUVsZW1lbnQoY3VzdG9tRW1lbnQuZGV0YWlsLmxpbmUub3V0cHV0Lm5vZGUpO1xuICAgICAgICAgICAgaWYgKCRub2RlKSB7XG4gICAgICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICRub2RlLm9uVXBkYXRlICYmICRub2RlLm9uVXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXNwYXRjaCh0aGlzLCAnbGluZS1hZGRlZCcsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWw6IGN1c3RvbUVtZW50LmRldGFpbCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZGlzcGF0Y2godGhpcywgJ2RpcnR5Jyk7XG4gICAgICAgIH0pO1xuICAgICAgICAkZ3JhcGguYWRkRXZlbnRMaXN0ZW5lcignbGluZS1yZW1vdmVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21FbWVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50PHtsaW5lOiBMaW5lRGF0YX0+O1xuICAgICAgICAgICAgY29uc3QgJG5vZGUgPSAkZ3JhcGgucXVlcnlOb2RlRWxlbWVudChjdXN0b21FbWVudC5kZXRhaWwubGluZS5vdXRwdXQubm9kZSk7XG4gICAgICAgICAgICBpZiAoJG5vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgJG5vZGUub25VcGRhdGUgJiYgJG5vZGUub25VcGRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpc3BhdGNoKHRoaXMsICdsaW5lLXJlbW92ZWQnLCB7XG4gICAgICAgICAgICAgICAgZGV0YWlsOiBjdXN0b21FbWVudC5kZXRhaWwsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGRpc3BhdGNoKHRoaXMsICdkaXJ0eScpO1xuICAgICAgICB9KTtcbiAgICAgICAgJGdyYXBoLmFkZEV2ZW50TGlzdGVuZXIoJ2xpbmUtY2hhbmdlZCcsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3VzdG9tRWxlbWVudCA9IGV2ZW50IGFzIEN1c3RvbUV2ZW50PHtsaW5lOiBMaW5lRGF0YX0+O1xuICAgICAgICAgICAgZGlzcGF0Y2godGhpcywgJ2xpbmUtY2hhbmdlZCcsIHtcbiAgICAgICAgICAgICAgICBkZXRhaWw6IGN1c3RvbUVsZW1lbnQuZGV0YWlsLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkaXNwYXRjaCh0aGlzLCAnZGlydHknKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGdyYXBoLmFkZEV2ZW50TGlzdGVuZXIoJ25vZGUtY29ubmVjdGVkJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21FbGVtZW50ID0gZXZlbnQgYXMgQ3VzdG9tRXZlbnQ8e2xpbmU6IExpbmVEYXRhfT47XG4gICAgICAgICAgICB0aGlzLnN0YXJ0UmVjb3JkaW5nKCk7XG4gICAgICAgICAgICB0aGlzLmFkZExpbmUoY3VzdG9tRWxlbWVudC5kZXRhaWwubGluZSk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3BSZWNvcmRpbmcoKTtcbiAgICAgICAgICAgIH0sIDIwMCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0ICRzdmcgPSAkZ3JhcGguc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKCcjbGluZXMnKSE7XG4gICAgICAgIGZ1bmN0aW9uIHNlYXJjaEcoaHRtbEFycmF5OiAoSFRNTEVsZW1lbnQgfCBTVkdHRWxlbWVudClbXSkge1xuICAgICAgICAgICAgaWYgKCFodG1sQXJyYXkpIHJldHVybjtcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IE1hdGgubWluKGh0bWxBcnJheS5sZW5ndGgsIDQpO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0ICRlbGVtID0gaHRtbEFycmF5W2ldO1xuICAgICAgICAgICAgICAgIC8vIOWmguaenOaJvuWIsOmhtumDqOeahCBkb2N1bWVudCDlhYPntKDnmoTor53vvIzmmK/msqHmnIkgdGFnTmFtZSDnmoRcbiAgICAgICAgICAgICAgICBpZiAoJGVsZW0udGFnTmFtZSAmJiAkZWxlbS50YWdOYW1lLnRvTG9jYWxlTG93ZXJDYXNlKCkgPT09ICdnJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJGVsZW0gYXMgU1ZHR0VsZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICRzdmcuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbnN0ICRnID0gc2VhcmNoRyhldmVudC5wYXRoKTtcbiAgICAgICAgICAgIGlmICghJGcgfHwgISRnLmhhc0F0dHJpYnV0ZSgnbGluZS11dWlkJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0eXBlID0gdGhpcy5wYXRoc1t0aGlzLnBhdGhzLmxlbmd0aCAtIDFdLnR5cGU7XG4gICAgICAgICAgICBjb25zdCBpbmZvID0gZ3JhcGhNYXAuZ2V0KHR5cGUpO1xuICAgICAgICAgICAgaWYgKCFpbmZvKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGluZm8uZ3JhcGguZXZlbnQgJiYgaW5mby5ncmFwaC5ldmVudC5vbkxpbmVEYmxDbGljaykge1xuICAgICAgICAgICAgICAgIGNvbnN0IG5vZGVzID0gJGdyYXBoLmdldFByb3BlcnR5KCdub2RlcycpIGFzIHsgW3V1aWQ6IHN0cmluZ106IEJsb2NrRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lcyA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbGluZXMnKSBhcyB7IFt1dWlkOiBzdHJpbmddOiBMaW5lRGF0YTsgfTtcbiAgICAgICAgICAgICAgICBjb25zdCB1dWlkID0gJGcuZ2V0QXR0cmlidXRlKCdsaW5lLXV1aWQnKSB8fCAnJztcbiAgICAgICAgICAgICAgICBjb25zdCBsaW5lID0gbGluZXNbdXVpZF0gYXMgTGluZURhdGE7XG4gICAgICAgICAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgTGluZU1vdXNlRXZlbnQobm9kZXMsIGxpbmVzLCAkZywgbGluZSk7XG4gICAgICAgICAgICAgICAgaW5mby5ncmFwaC5ldmVudC5vbkxpbmVEYmxDbGljayhldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAkc3ZnLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBjb25zdCAkZyA9IHNlYXJjaEcoZXZlbnQucGF0aCk7XG4gICAgICAgICAgICBpZiAoISRnIHx8ICEkZy5oYXNBdHRyaWJ1dGUoJ2xpbmUtdXVpZCcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgdHlwZSA9IHRoaXMucGF0aHNbdGhpcy5wYXRocy5sZW5ndGggLSAxXS50eXBlO1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGdyYXBoTWFwLmdldCh0eXBlKTtcbiAgICAgICAgICAgIGlmICghaW5mbykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpbmZvLmdyYXBoLmV2ZW50ICYmIGluZm8uZ3JhcGguZXZlbnQub25MaW5lQ2xpY2spIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlcyA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbm9kZXMnKSBhcyB7IFt1dWlkOiBzdHJpbmddOiBCbG9ja0RhdGE7IH07XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSAkZ3JhcGguZ2V0UHJvcGVydHkoJ2xpbmVzJykgYXMgeyBbdXVpZDogc3RyaW5nXTogTGluZURhdGE7IH07XG4gICAgICAgICAgICAgICAgY29uc3QgdXVpZCA9ICRnLmdldEF0dHJpYnV0ZSgnbGluZS11dWlkJykgfHwgJyc7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW3V1aWRdIGFzIExpbmVEYXRhO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IExpbmVNb3VzZUV2ZW50KG5vZGVzLCBsaW5lcywgJGcsIGxpbmUpO1xuICAgICAgICAgICAgICAgIGluZm8uZ3JhcGguZXZlbnQub25MaW5lQ2xpY2soZXZlbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJHN2Zy5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICBjb25zdCAkZyA9IHNlYXJjaEcoZXZlbnQucGF0aCk7XG4gICAgICAgICAgICBpZiAoISRnIHx8ICEkZy5oYXNBdHRyaWJ1dGUoJ2xpbmUtdXVpZCcpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKChldmVudCBhcyBNb3VzZUV2ZW50KS5idXR0b24gIT09IDIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB0aGlzLnBhdGhzW3RoaXMucGF0aHMubGVuZ3RoIC0gMV0udHlwZTtcbiAgICAgICAgICAgIGNvbnN0IGluZm8gPSBncmFwaE1hcC5nZXQodHlwZSk7XG4gICAgICAgICAgICBpZiAoIWluZm8pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoaW5mby5ncmFwaC5ldmVudCAmJiBpbmZvLmdyYXBoLmV2ZW50Lm9uTGluZVJpZ2h0Q2xpY2spIHtcbiAgICAgICAgICAgICAgICBjb25zdCBub2RlcyA9ICRncmFwaC5nZXRQcm9wZXJ0eSgnbm9kZXMnKSBhcyB7IFt1dWlkOiBzdHJpbmddOiBCbG9ja0RhdGE7IH07XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZXMgPSAkZ3JhcGguZ2V0UHJvcGVydHkoJ2xpbmVzJykgYXMgeyBbdXVpZDogc3RyaW5nXTogTGluZURhdGE7IH07XG4gICAgICAgICAgICAgICAgY29uc3QgdXVpZCA9ICRnLmdldEF0dHJpYnV0ZSgnbGluZS11dWlkJykgfHwgJyc7XG4gICAgICAgICAgICAgICAgY29uc3QgbGluZSA9IGxpbmVzW3V1aWRdIGFzIExpbmVEYXRhO1xuICAgICAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gbmV3IExpbmVNb3VzZUV2ZW50KG5vZGVzLCBsaW5lcywgJGcsIGxpbmUpO1xuICAgICAgICAgICAgICAgIGluZm8uZ3JhcGguZXZlbnQub25MaW5lUmlnaHRDbGljayhldmVudCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3VwZGF0ZUdyYXBoKCkge1xuICAgICAgICBjbGVhckR5bmFtaWNFbnVtKCk7XG4gICAgICAgIGNvbnN0IGdyYXBoID0gdGhpcy5wYXRoc1t0aGlzLnBhdGhzLmxlbmd0aCAtIDFdO1xuICAgICAgICBjb25zdCAkZ3JhcGggPSB0aGlzLnNoYWRvd1Jvb3QhLnF1ZXJ5U2VsZWN0b3IoJ3YtZ3JhcGgnKSEgYXMgR3JhcGhFbGVtZW50O1xuICAgICAgICAkZ3JhcGguY2xlYXIoKTtcbiAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgICAgICAgICRncmFwaC5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCBncmFwaC50eXBlKTtcbiAgICAgICAgICAgICRncmFwaC5zZXRQcm9wZXJ0eSgnbGluZXMnLCBncmFwaC5saW5lcyk7XG4gICAgICAgICAgICAkZ3JhcGguc2V0UHJvcGVydHkoJ25vZGVzJywgZ3JhcGgubm9kZXMpO1xuICAgICAgICAgICAgdGhpcy5fdXBkYXRlSGVhZGVyKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyB1bmRvKCkge1xuICAgICAgICB0aGlzLmFjdGlvblF1ZXVlLnVuZG8oKTtcbiAgICAgICAgZGlzcGF0Y2godGhpcywgJ3VuZG8nKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVkbygpIHtcbiAgICAgICAgdGhpcy5hY3Rpb25RdWV1ZS5yZWRvKCk7XG4gICAgICAgIGRpc3BhdGNoKHRoaXMsICdyZWRvJyk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXJ0UmVjb3JkaW5nKCkge1xuICAgICAgICB0aGlzLmFjdGlvblF1ZXVlLnN0YXJ0UmVjb3JkaW5nKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0b3BSZWNvcmRpbmcoKSB7XG4gICAgICAgIHRoaXMuYWN0aW9uUXVldWUuc3RvcFJlY29yZGluZygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQaW5FbGVtZW50KGJsb2NrTmFtZTogc3RyaW5nLCB0eXBlOiAnaW5wdXQnIHwgJ291dHB1dCcsIGluZGV4OiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgJGJsb2NrID0gdGhpcy4kZ3JhcGguc2hhZG93Um9vdC5xdWVyeVNlbGVjdG9yKGB2LWdyYXBoLW5vZGVbbm9kZS11dWlkPSR7YmxvY2tOYW1lfV1gKTtcbiAgICAgICAgaWYgKCEkYmxvY2spIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCAkcGluTGlzdCA9ICRibG9jay5zaGFkb3dSb290IS5xdWVyeVNlbGVjdG9yQWxsKGAucGluLmluYCk7XG4gICAgICAgIGNvbnN0ICRwaW4gPSAkcGluTGlzdFtpbmRleF07XG4gICAgICAgIHJldHVybiAkcGluO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRCbG9ja0VsZW1lbnQoYmxvY2tOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGdyYXBoLnNoYWRvd1Jvb3QucXVlcnlTZWxlY3Rvcihgdi1ncmFwaC1ub2RlW25vZGUtdXVpZD0ke2Jsb2NrTmFtZX1dYCkgYXMgR3JhcGhOb2RlRWxlbWVudDtcbiAgICB9XG5cbiAgICAvLy8gLS0tLSDmk43kvZzmlbTkuKrlm75cblxuICAgIC8qKlxuICAgICAqIOWwhuWxj+W5leWdkOagh+i9rOaNouaIkCBHcmFwaCDlhoXnmoTlnZDmoIdcbiAgICAgKiBAcGFyYW0gcG9pbnRcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGNvbnZlcnRDb29yZGluYXRlKHBvaW50OiB7IHg6IG51bWJlciwgeTogbnVtYmVyIH0pIHtcbiAgICAgICAgcG9pbnQgPSB0aGlzLiRncmFwaC5jb252ZXJ0Q29vcmRpbmF0ZShwb2ludC54LCBwb2ludC55KTtcbiAgICAgICAgcmV0dXJuIHBvaW50O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiuvue9rue8lui+keeahOagueWbvlxuICAgICAqIEBwYXJhbSBncmFwaFxuICAgICAqL1xuICAgIHNldFJvb3RHcmFwaChncmFwaDogR3JhcGhEYXRhKSB7XG4gICAgICAgIHRoaXMucm9vdEdyYXBoID0gZ3JhcGg7XG4gICAgICAgIHRoaXMucGF0aHMgPSBbZ3JhcGhdO1xuICAgICAgICB0aGlzLl91cGRhdGVHcmFwaCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPluato+WcqOe8lui+keeahOagueWbvlxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0Um9vdEdyYXBoKCk6IEdyYXBoRGF0YSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBhdGhzWzBdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS8oOWFpeS4gOS4quWtl+espuS4su+8jOWPjeW6j+WIl+WMluaIkOWbvuaVsOaNrlxuICAgICAqIEBwYXJhbSBjb250ZW50XG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBkZXNlcmlhbGl6ZShjb250ZW50OiBzdHJpbmcpOiBHcmFwaERhdGEge1xuICAgICAgICBjb25zdCBncmFwaERhdGEgPSB5YW1sLmxvYWQoY29udGVudCkgYXMgR3JhcGhEYXRhO1xuICAgICAgICByZXR1cm4gZ3JhcGhEYXRhO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOS8oOWFpeS4gOS4quWbvuaVsOaNru+8jOW6j+WIl+WMluaIkCB5YW1sIOWtl+espuS4slxuICAgICAqIEBwYXJhbSBkYXRhXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBzZXJpYWxpemUoZGF0YT86IEdyYXBoRGF0YSk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IHN0ciA9IHlhbWwuZHVtcChkYXRhIHx8IHRoaXMucGF0aHNbMF0pO1xuICAgICAgICAvLyByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5wYXRoc1swXSk7XG4gICAgICAgIC8vIG91dHB1dEZpbGVTeW5jKCcvVXNlcnMvd2FuZ3NpamllL1Byb2plY3QvQ3JlYXRvci9jb2Nvcy1lZGl0b3IvZXh0ZW5zaW9uLXJlcG9zL3NoYWRlci1ncmFwaC90ZXN0LnlhbWwnLCBzdHIpO1xuICAgICAgICByZXR1cm4gc3RyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPluaVtOS4quWbvueOsOWcqOeahOS4gOS6m+WfuuehgOaVsOaNrlxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0R3JhcGhJbmZvKCkge1xuICAgICAgICBjb25zdCBvZmZzZXQgPSB0aGlzLiRncmFwaC5nZXRQcm9wZXJ0eSgnb2Zmc2V0Jyk7XG4gICAgICAgIGNvbnN0IHNjYWxlID0gdGhpcy4kZ3JhcGguZ2V0UHJvcGVydHkoJ3NjYWxlJyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvZmZzZXQsIHNjYWxlLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiuvue9ruaVtOS4quWbvueahOS4gOS6m+WfuuehgOaVsOaNrlxuICAgICAqIEBwYXJhbSBpbmZvXG4gICAgICovXG4gICAgc2V0R3JhcGhJbmZvKGluZm86IHsgb2Zmc2V0OiB7IHg6IG51bWJlciwgeTogbnVtYmVyLCB9LCBzY2FsZTogbnVtYmVyfSkge1xuICAgICAgICB0aGlzLiRncmFwaC5zZXRQcm9wZXJ0eSgnb2Zmc2V0JywgaW5mby5vZmZzZXQpO1xuICAgICAgICB0aGlzLiRncmFwaC5zZXRQcm9wZXJ0eSgnc2NhbGUnLCBpbmZvLnNjYWxlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmgaLlpI3nvKnmlL7mr5TkvotcbiAgICAgKi9cbiAgICB6b29tVG9GaXQoKSB7XG4gICAgICAgIHRoaXMuJGdyYXBoLmRhdGEuc2V0UHJvcGVydHkoJ3NjYWxlJywgMSk7XG4gICAgfVxuXG4gICAgLy8vIC0tLS0g5pON5L2c5b2T5YmN5Zu+XG5cbiAgICAvKipcbiAgICAgKiDojrflj5bpgInkuK3nmoQgQmxvY2sg5YiX6KGoXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBnZXRTZWxlY3RlZEJsb2NrTGlzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuJGdyYXBoLmdldFNlbGVjdGVkTm9kZUxpc3QoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDojrflj5bpgInkuK3nmoQgTGluZSDliJfooahcbiAgICAgKiBAcmV0dXJuc1xuICAgICAqL1xuICAgIGdldFNlbGVjdGVkTGluZUxpc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRncmFwaC5nZXRTZWxlY3RlZExpbmVMaXN0KCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog6K6+572u5b2T5YmN5q2j5Zyo57yW6L6R55qE5Zu+5pWw5o2uXG4gICAgICogQHBhcmFtIGdyYXBoXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBzZXRDdXJyZW50R3JhcGgoZ3JhcGg6IEdyYXBoRGF0YSkge1xuICAgICAgICBpZiAodGhpcy5wYXRocy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgdGhpcy5zZXRSb290R3JhcGgoZ3JhcGgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGF0aHNbdGhpcy5wYXRocy5sZW5ndGggLSAxXSA9IGdyYXBoO1xuICAgICAgICB0aGlzLl91cGRhdGVHcmFwaCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOiOt+WPluato+WcqOe8lui+keeahOWbvuaVsOaNrlxuICAgICAqIEByZXR1cm5zXG4gICAgICovXG4gICAgZ2V0Q3VycmVudEdyYXBoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoc1t0aGlzLnBhdGhzLmxlbmd0aCAtIDFdO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOW9k+WJjeato+WcqOaTjeS9nOeahOWbvuaVsOaNrumHjOWinuWKoOS4gOS4qiBCbG9ja1xuICAgICAqIEBwYXJhbSBibG9ja1xuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIGFkZEJsb2NrKGJsb2NrOiBCbG9ja0RhdGEsIGlkPzogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aW9uUXVldWUuZXhlYyhuZXcgQWRkQmxvY2tBY3Rpb24oeyBibG9jaywgaWQgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOW9k+WJjeato+WcqOaTjeS9nOeahOWbvuaVsOaNrumHjOWIoOmZpOS4gOS4quiKgueCuVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIHJlbW92ZUJsb2NrKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcXVldWU6IEFjdGlvbltdID0gW107XG4gICAgICAgIC8vIHJlbW92ZSBsaW5lXG4gICAgICAgIGNvbnN0IGxpbmVzID0gdGhpcy4kZ3JhcGguZ2V0UHJvcGVydHkoJ2xpbmVzJykgYXMgeyBbdXVpZDogc3RyaW5nXTogTGluZURhdGE7IH07XG4gICAgICAgIGZvciAoY29uc3Qga2V5IGluIGxpbmVzKSB7XG4gICAgICAgICAgICBjb25zdCBsaW5lID0gbGluZXNba2V5XSBhcyBMaW5lRGF0YTtcbiAgICAgICAgICAgIGlmIChsaW5lLmlucHV0Lm5vZGUgPT09IGlkIHx8IGxpbmUub3V0cHV0Lm5vZGUgPT09IGlkKSB7XG4gICAgICAgICAgICAgICAgcXVldWUucHVzaChuZXcgUmVtb3ZlTGluZUFjdGlvbih7IGlkOiBrZXkgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlLnB1c2gobmV3IFJlbW92ZUJsb2NrQWN0aW9uKHsgaWQgfSkpO1xuICAgICAgICB0aGlzLmFjdGlvblF1ZXVlLmV4ZWMobmV3IEFjdGlvbkxpc3Qoe1xuICAgICAgICAgICAgcXVldWUsXG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlvZPliY3mraPlnKjmk43kvZznmoTlm77mlbDmja7ph4zlop7liqDkuIDkuKrov57nur9cbiAgICAgKiBAcGFyYW0gbGluZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIGFkZExpbmUobGluZTogTGluZURhdGEsIGlkPzogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuYWN0aW9uUXVldWUuZXhlYyhuZXcgQWRkTGluZUFjdGlvbih7IGxpbmUsIGlkIH0pKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDlnKjlvZPliY3mraPlnKjmk43kvZznmoTlm77mlbDmja7ph4zliKDpmaTkuIDkuKrov57nur9cbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKi9cbiAgICByZW1vdmVMaW5lKGlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hY3Rpb25RdWV1ZS5leGVjKG5ldyBSZW1vdmVMaW5lQWN0aW9uKHsgaWQgfSkpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOi/m+WFpeW9k+WJjeWbvueahOWtkOWbvlxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqL1xuICAgIGVudGVyU3ViR3JhcGgoaWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBncmFwaCA9IHRoaXMucGF0aHNbdGhpcy5wYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgY29uc3Qgc3ViR3JhcGggPSBncmFwaC5ncmFwaHNbaWRdO1xuICAgICAgICBpZiAoc3ViR3JhcGgpIHtcbiAgICAgICAgICAgIHRoaXMucGF0aHMucHVzaChzdWJHcmFwaCk7XG4gICAgICAgICAgICB0aGlzLl91cGRhdGVHcmFwaCgpO1xuICAgICAgICB9XG4gICAgICAgIGRpc3BhdGNoKHRoaXMsICdlbnRlci1ncmFwaCcsIHtcbiAgICAgICAgICAgIGRldGFpbDoge1xuICAgICAgICAgICAgICAgIGlkOiBpZCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIOWcqOW9k+WJjee8lui+keeahOWbvumHjOWinuWKoOS4gOS4quWtkOWbvlxuICAgICAqIEBwYXJhbSB0eXBlXG4gICAgICogQHBhcmFtIGlkXG4gICAgICogQHJldHVybnNcbiAgICAgKi9cbiAgICBhZGRTdWJHcmFwaCh0eXBlOiBzdHJpbmcsIGlkOiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgaW5mbyA9IHRoaXMucGF0aHNbdGhpcy5wYXRocy5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gY29uc3QgdXVpZCA9IGdlbmVyYXRlVVVJRCgpO1xuICAgICAgICBpbmZvLmdyYXBoc1tpZF0gPSB7XG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgbmFtZTogdHlwZSxcbiAgICAgICAgICAgIG5vZGVzOiB7fSxcbiAgICAgICAgICAgIGxpbmVzOiB7fSxcbiAgICAgICAgICAgIGdyYXBoczoge30sXG4gICAgICAgIH0gYXMgR3JhcGhEYXRhO1xuXG4gICAgICAgIHJldHVybiBpbmZvLmdyYXBoc1tpZF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Zyo5b2T5YmN57yW6L6R55qE5Zu+6YeM77yM5Yig6Zmk5LiA5Liq5a2Q5Zu+XG4gICAgICogQHBhcmFtIGlkXG4gICAgICovXG4gICAgcmVtb3ZlU3ViR3JhcGgoaWQ6IHN0cmluZykge1xuICAgICAgICBjb25zdCBpbmZvID0gdGhpcy5wYXRoc1t0aGlzLnBhdGhzLmxlbmd0aCAtIDFdO1xuICAgICAgICBkZWxldGUgaW5mby5ncmFwaHNbaWRdO1xuICAgIH1cbn1cblxuaWYgKCF3aW5kb3cuY3VzdG9tRWxlbWVudHMuZ2V0KCd1aS1ncmFwaC1mb3JnZScpKSB7XG4gICAgd2luZG93LmN1c3RvbUVsZW1lbnRzLmRlZmluZSgndWktZ3JhcGgtZm9yZ2UnLCBIVE1MR3JhcGhGb3JnZUVsZW1lbnQpO1xufVxuIl19