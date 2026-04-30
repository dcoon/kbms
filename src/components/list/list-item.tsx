import { uilog as log } from '@/services/log/log-service';
import { ThemeType } from '@/theme/theme';
import { formatDistanceToNow } from 'date-fns';
import { Children, default as React, useEffect, useState } from 'react';
import { ListRenderItem, View } from 'react-native';
import { Icon, List as PaperList, Switch, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { Dropdown, Option } from 'react-native-paper-dropdown';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';


const LOG_SRC = "ListItemComponent";

interface ListItemProps {
  title: string;
  value?: any;
  icon?: IconSource;
  valueIcon?: IconSource;
  description?: string;
  editable?: boolean;
  onPress?: (value: any) => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
}



function DropdownValue(props: ListItemProps) {

  const { title, value, onPress } = props as any;

  const arr = value as any[];
  const selectedValue = value[0] as string;
  const options = value.slice(1) as Option[]; // assuming value is a tuple of [currentValue, options]

  return (
    <View
      style={{ width: "40%" }}
    >
      <Dropdown
        label={title}

        // placeholder={"Select " + title}
        options={options}
        value={selectedValue}
        onSelect={onPress}
      />
    </View>
    // <Text>{JSON.stringify(options)}</Text>
  );

}

function ButtonValue(props: ListItemProps) {

  const theme = useTheme() as ThemeType;
  const name = (props.valueIcon as { source: string }).source as string;
  return (
    <TouchableRipple onPress={props.onPress} >
      <Icon source={name} size={theme.icons.iconSize} color={theme.colors.onSurface} />
    </TouchableRipple>
  );
}

function TextValue(props: ListItemProps) {

  const { value, editable, onPress } = props as any;

  if (editable) {
    return (
      <TextInput mode="outlined" value={value} onChangeText={onPress} editable={true} />
    );
  } else {
    return (
      <Text variant="labelMedium">{value}</Text>
    );
  }
}

function BooleanValue(props: ListItemProps) {

  const { value, editable, onPress } = props as any;

  if (editable) {
    return (
      <Switch value={value} onValueChange={onPress} />
    );
  } else {
    return (
      <PaperList.Icon icon={value ? "check" : "close"} />
    );
  }
}





function LeftSideContent({ icon, left }: ListItemProps) {


  const theme = useTheme() as ThemeType;

  if (left !== undefined) {
    return (left);
  } else if (icon) {
    const name = (icon as { source: string }).source as string;
    const color = theme.colors.onSurface;

    return (
      <PaperList.Icon icon={name} color={color} />
    );
  } else {
    return null;
  }
}


function RightSideContent(props: ListItemProps) {

  const { right, value, onPress, editable } = props;

  if (right) {
    return (right);
  } else if (onPress !== undefined && value === undefined) {
    return (<ButtonValue {...props} />);
  } else if (value === undefined) {
    return null;
  } else if (Array.isArray(value)) {
    return (<DropdownValue {...props} />);
  } else if (typeof value === "boolean") {
    return (<BooleanValue {...props} />);
  } else if (typeof value === "number") {
    return (<TextValue {...props} />);
  } else if (typeof value === "string") {
    return (<TextValue {...props} />);
  } else {
    const json = JSON.stringify(value);
    return (<Text>{json}</Text>);
  }


}


export function ListItem(props: ListItemProps) {

  const { title, description, value, icon, editable = false, onPress, left, right } = props;

  return (
    <PaperList.Item
      title={title}
      description={description}
      left={() => <LeftSideContent {...props} />}
      right={() => <RightSideContent {...props} />}
      onPress={onPress}
      titleNumberOfLines={0}
      style={{ paddingLeft: 8 }}

    />
  );
}

interface ListAccordionProps {
  id: string;
  title: string;
  description: string;
  icon?: string;
  data?: any[];
  hideIfNoData?: boolean;
  keyExtractor?: (item: any) => string;
  renderItem?: ListRenderItem<any>;
  listEmptyComponent?: ListRenderItem<any>;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

function ListAccordion({ id, title, description, icon, data, hideIfNoData = true, keyExtractor, renderItem, listEmptyComponent, left, right, children }: ListAccordionProps) {

  const hasChildren = Children.count(children) > 0;

  if (hideIfNoData && (!data || data.length === 0) && !hasChildren) {
    return (
      <View />
    );
  }



  if (renderItem === undefined || renderItem === null) {
    renderItem = ({ item }) => <ListItem title={String(item)} description={description} icon={icon} value={item} />;
  }

  function DataMaybe(props: any) {

    if (data === undefined || data === null) {
      return (<View />);
    }

    return (
      < StaticList data={data || []} keyExtractor={keyExtractor} renderItem={renderItem} listEmptyComponent={listEmptyComponent} />
    );
  }


  // 3 states: has date=list of data (or loading), data array is empty, no data; data is undefined and no children, don't show

  return (
    <PaperList.Accordion title={title} id={id} description={description} left={() => left} right={() => right}>
      <DataMaybe />
      {children}
    </PaperList.Accordion>
  )
}


interface StaticListProps {
  data: any[];
  keyExtractor?: (item: any) => string;
  renderItem?: ListRenderItem<any>;
  listEmptyComponent?: ListRenderItem<any>;
  children?: React.ReactNode;
}

function StaticList({ data, keyExtractor, renderItem, listEmptyComponent, children }: StaticListProps) {

  const LOG_PREFIX = LOG_SRC + " : StaticList : ";

  if (data === undefined || data === null || data.length === 0) {

    log.debug(LOG_PREFIX, "No data");
    return (
      <ListEmptyComponent item={undefined} index={0} separators={{}} />

    );
  }


  if (keyExtractor === undefined || keyExtractor === null) {
    keyExtractor = lookForKeyExtractor(data);
  }



  function ListEmptyComponent({ item, index, separators }: { item: any; index: number; separators: any }) {
    return (
      <View>
        {listEmptyComponent ? listEmptyComponent({ item, index, separators }) : <Text>No data</Text>}
        {children}
      </View>
    );
  }


  function lookForKeyExtractor(data: any): typeof keyExtractor {
    const keys = Object.keys(data);
    const possibleGoodKeys = ["key", "id", "uuid", "name"];
    const intersection = keys.filter(value => possibleGoodKeys.includes(value));

    if (intersection.length > 0) {
      return (item: any) => item[intersection[0]];
    } else {
      return (item: any) => JSON.stringify(item);
    }

  }

  function ListItemWrapper({ item, index, separators, key, children }: { item: any; index: number; separators: any; key: string; children?: React.ReactNode }) {
    // const rendered = renderItem ? renderItem({ item, index, separators }) : <ListItem key={keyExtractor!(item)} title={String(item)} value={item} description={undefined} icon={"help-circle-outline"} />;

    return (<View key={key}>
      {renderItem ? renderItem({ item, index, separators }) : null}
      {children}
    </View>
    );
  }

  return (
    <View>
      {data && data.map((item, index) => ListItemWrapper({ item, index, separators: {}, key: keyExtractor!(item), children: undefined }))}
      {children}
    </View>

  );
}


interface MaybeProps {
  visible: boolean;
  children?: React.ReactNode;
}

function Maybe({ visible, children }: MaybeProps) {
  if (visible) {
    return (
      <>
        {children}
      </>
    );
  } else {
    return null;
  }
}


export function LastSeenListItem({ lastUpdated }: { lastUpdated?: Date; }) {

  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  const lastSeenMsg = lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : "Unknown";


  const INTERVAL_DURATION = 60000;

  const refreshEveryMinute = useEffect(() => {
    const interval = setInterval(() => {
      setLastRefreshed(Date.now());
    }, INTERVAL_DURATION);
    return () => clearInterval(interval);
  }, []);



  return (
    <List.Item
      title="Last Updated"
      description="Last time the battery data was updated"
      value={lastSeenMsg}
      icon="clock-outline" />


  );
}


function Section({ title, description, children, id = title }: { title: string; description?: string; children?: React.ReactNode, id?: string }) {

  const theme = useTheme() as ThemeType;
  return (
    <View id={id} >
      <View style={theme.components.section.header.style}>
        <Text style={theme.components.section.header.titleStyle}>{title}</Text>
        <Text style={theme.components.section.header.descriptionStyle}>{description}</Text>
      </View>
      <View style={theme.components.section.contentStyle}>
        {children}
      </View>
    </View>
  );
}

export const List = {
  Item: ListItem,
  Accordion: ListAccordion,
  StaticList,
  Maybe,
  LastSeenListItem,
  Icon: PaperList.Icon,
  AccordionGroup: PaperList.AccordionGroup,
  Section,
  Subheader: PaperList.Subheader,

}
