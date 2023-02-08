// SPDX-FileCopyrightText: Meta Platforms, Inc. and its affiliates
// SPDX-FileCopyrightText: TNG Technology Consulting GmbH <https://www.tngtech.com>
//
// SPDX-License-Identifier: Apache-2.0

import React, { ChangeEvent, ReactElement, useState } from 'react';
import MuiBox from '@mui/material/Box';
import MuiList from '@mui/material/List';
import MuiTypography from '@mui/material/Typography';
import AddBoxIcon from '@mui/icons-material/AddBox';
import {
  clickableIcon,
  disabledIcon,
  OpossumColors,
} from '../../shared-styles';
import { ListWithAttributesItem } from '../../types/types';
import { SxProps } from '@mui/system';
import { getSxFromPropsAndClasses } from '../../util/get-sx-from-props-and-classes';
import { TextBox } from '../InputElements/TextBox';
import { IconButton } from '../IconButton/IconButton';
import { ListWithAttributesListItem } from '../ListWithAttributesListItem/ListWithAttributesListItem';

const LIST_TITLE_HEIGHT = 36;

const classes = {
  titleAndListBox: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '15px',
  },
  title: {
    backgroundColor: OpossumColors.white,
    paddingLeft: '9px',
    paddingBottom: '8px',
    height: `${LIST_TITLE_HEIGHT}px - 8px`,
  },
  list: {
    padding: '0px',
    width: '250px',
    backgroundColor: OpossumColors.white,
    maxHeight: `calc(100% - ${LIST_TITLE_HEIGHT}px)`,
    overflowY: 'auto',
  },
};

interface ListWithAttributesProps {
  listItems: Array<ListWithAttributesItem>;
  selectedListItemId: string;
  highlightedAttributeIds?: Array<string>;
  handleListItemClick: (id: string) => void;
  showChipsForAttributes: boolean;
  showAddNewListItem?: boolean;
  manuallyAddedListItems?: Array<string>;
  setManuallyAddedListItems?(items: Array<string>): void;
  title?: string;
  listSx?: SxProps;
  emptyTextFallback?: string;
}

export function ListWithAttributes(
  props: ListWithAttributesProps
): ReactElement {
  const [textBoxInput, setTextBoxInput] = useState<string>('');

  function handleTextBoxInputChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ): void {
    setTextBoxInput(event.target.value);
  }

  function handleAddNewInputClick(): void {
    if (
      !props.manuallyAddedListItems?.includes(textBoxInput) &&
      props.setManuallyAddedListItems &&
      props.manuallyAddedListItems
    ) {
      props.setManuallyAddedListItems([
        textBoxInput,
        ...props.manuallyAddedListItems,
      ]);
    }
    setTextBoxInput('');
  }

  const textInputIsInvalid = !textBoxInput || !textBoxInput.trim().length;

  return (
    <MuiBox sx={classes.titleAndListBox}>
      <MuiTypography sx={classes.title} variant={'subtitle1'}>
        {props.title}
      </MuiTypography>
      <MuiList
        sx={getSxFromPropsAndClasses({
          sxProps: props.listSx,
          styleClass: classes.list,
        })}
      >
        {props.listItems.map((item, index) => (
          <ListWithAttributesListItem
            item={item}
            key={`itemId-${item.id}`}
            handleListItemClick={props.handleListItemClick}
            isSelected={item.id === props.selectedListItemId}
            showChipsForAttributes={props.showChipsForAttributes}
            isFirstItem={index === 0}
            isLastItem={index === props.listItems.length - 1}
            listContainsSingleItem={props.listItems.length === 1}
            emptyTextFallback={props.emptyTextFallback}
          />
        ))}
      </MuiList>
      {props.showAddNewListItem && (
        <TextBox
          title={'Add new item'}
          isEditable={true}
          handleChange={handleTextBoxInputChange}
          text={textBoxInput}
          endIcon={
            <IconButton
              icon={
                <AddBoxIcon
                  sx={textInputIsInvalid ? disabledIcon : clickableIcon}
                />
              }
              onClick={handleAddNewInputClick}
              disabled={textInputIsInvalid}
              tooltipTitle={
                textInputIsInvalid
                  ? 'Enter text to add a new item to the list'
                  : 'Click to add a new item to the list'
              }
              tooltipPlacement={'right'}
            />
          }
        />
      )}
    </MuiBox>
  );
}