import { uilog as log } from '@/services/log/log-service';
import { formatDistanceToNow } from 'date-fns';
import { Children, default as React, useEffect, useState } from 'react';
import { ListRenderItem, View } from 'react-native';
import { List as PaperList, Switch, Text, TextInput } from 'react-native-paper';


const LOG_SRC = "ListItemComponent";


function TextValue({ value, editable, onChange, children }: { value: string, editable: boolean, onChange?: (value: any) => void, children?: React.ReactNode }) {

  if (editable) {
    return (
      <TextInput mode="outlined" value={value} onChangeText={onChange} editable={true} />
    );
  } else {
    return (
      <Text>{value}</Text>
    );
  }
}

function BooleanValue({ value, editable, onChange, children }: { value: boolean, editable: boolean, onChange?: (value: any) => void, children?: React.ReactNode }) {

  if (editable) {
    return (
      <Switch value={value} onValueChange={onChange} />
    );
  } else {
    return (
      <PaperList.Icon icon={value ? "check" : "close"} />
    );
  }
}


interface ListItemProps {
  title: string;
  value?: any;
  icon?: string;
  description?: string;
  editable?: boolean;
  onPress?: (value: any) => void;
  onChange?: (value: any) => void;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

function ListItem({ title, description, icon, value, editable = false, left, right, onPress, onChange, children }: ListItemProps) {


  function ValueContent() {
    if (right) {
      return null;
    } else if (value === undefined || value === null) {
      return null;
    } else if (typeof value === "boolean") {
      return (<BooleanValue value={value} editable={editable} onChange={onChange} />);
    } else if (typeof value === "string") {
      return (<TextValue value={value} editable={editable} onChange={onChange} />);
    } else {
      const json = JSON.stringify(value);
      return (<Text>{json}</Text>);
    }

  }


  function RightSideContent() {

    return (
      <View>
        <ValueContent />
        {right}
      </View>
    );

  }

  function LeftSideContent() {


    function IconButtonMaybe(props: any) {

      if (icon) {
        return (
          <List.Icon icon={icon} {...props} />
        );
      } else {
        return <View />;
      }
    }


    return (
      <View>
        <IconButtonMaybe />
        {left}
      </View>
    );
  }


  return (
    <PaperList.Item
      title={title}
      description={description}
      left={LeftSideContent}
      right={RightSideContent}
      onPress={onPress}
      titleNumberOfLines={0}
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

export const List = {
  Item: ListItem,
  Accordion: ListAccordion,
  StaticList,
  Maybe,
  LastSeenListItem,
  Icon: PaperList.Icon,
  AccordionGroup: PaperList.AccordionGroup,
  Section: PaperList.Section,
  Subheader: PaperList.Subheader,

}
