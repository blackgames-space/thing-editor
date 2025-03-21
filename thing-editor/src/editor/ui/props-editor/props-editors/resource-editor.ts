import type { ComponentChild } from 'preact';
import fs, { AssetType } from 'thing-editor/src/editor/fs';
import R from 'thing-editor/src/editor/preact-fabrics';
import type { ContextMenuItem } from 'thing-editor/src/editor/ui/context-menu';
import showContextMenu from 'thing-editor/src/editor/ui/context-menu';
import type { EditablePropertyEditorProps } from 'thing-editor/src/editor/ui/props-editor/props-field-wrapper';
import copyTextByClick from 'thing-editor/src/editor/utils/copy-text-by-click';
import game from 'thing-editor/src/engine/game';

const resourceEditorProps = { className: 'asset-editor' };

let assetNameProps = {
	className: 'selectable-text',
	title: 'Ctrl+click to copy resource`s name',
	onMouseDown: copyTextByClick
};

const ResourceEditor = (props: EditablePropertyEditorProps): ComponentChild => {
	const file = fs.getFileByAssetName(props.value, AssetType.RESOURCE);
	return R.div(resourceEditorProps,
		R.btn(props.value ? R.span(assetNameProps, props.value) : '. . .', () => {
			game.editor.chooseAsset(AssetType.RESOURCE, 'Select "' + props.field.name, props.value, undefined, props.field.filterAssets).then((selectedResource) => {
				if (selectedResource) {
					props.onChange(selectedResource);
					game.editor.history.scheduleHistorySave();
				}
			});
		}, props.value, (!props.value || file) ? 'choose-asset-button' : 'choose-asset-button danger'),
		props.value && (props.field.canBeEmpty !== false) ? R.btn(R.icon('reject'), (ev: PointerEvent) => {
			showContextMenu([
				{
					name: R.fragment(R.icon('reject'), 'Clear \'' + props.field.name + '\''),
					onClick: () => {
						props.onChange(props.field.canBeEmpty === false ? props.field.default : null);
					}
				},
				{
					name: 'Cancel',
					onClick: () => { } // eslint-disable-line @typescript-eslint/no-empty-function
				}
			], ev);
		}, 'Clear', 'tool-button') : undefined
	);
};

ResourceEditor.parser = (val: string) => {
	return val || null;
};

ResourceEditor.contextMenuInjection = (contextMenu: ContextMenuItem[], _field:EditablePropertyDesc, _clickedValue:any, _value:any) => {
	if (_clickedValue) {
		contextMenu.splice(contextMenu.indexOf(null) + 1, 0, {
			name: 'Reveal In Explorer',
			onClick: () => {
				const file = fs.getFileByAssetName(_clickedValue, AssetType.IMAGE);
				if (file) {
					fs.showFile(file.fileName);
				}
			}
		});
	}
};

export default ResourceEditor;
