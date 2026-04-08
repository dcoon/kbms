import React from 'react';
import { View } from 'react-native';
import { Button, SegmentedButtons } from 'react-native-paper';


export type SortKey = string;
export type SortOrder = 'asc' | 'desc';

export interface SortButtonDefinition {
  sortKey: SortKey;
  label: string;
}

// interface SortButtonProps {
//   definition: SortButtonDefinition;
//   isActive: boolean;
//   sortOrder: SortOrder;
//   onPress: (sortKey: SortKey, sortOrder: SortOrder) => void;
// }


interface DeviceListHeaderProps {
  buttons: SortButtonDefinition[];
  sortKey: string;
  sortOrder: SortOrder;
  filter: string;
  onSort: (key2: SortKey, order: SortOrder, filter: string) => void;
}

const DeviceListHeader = ({ buttons, sortKey, sortOrder, filter: sortFilter, onSort }: DeviceListHeaderProps) => {
  // log.debug("Rendering DeviceListHeader with buttons: ", buttons, " key: ", sortKey, " order: ", sortOrder);



  return (
    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: 'transparent' }}>




      <Button mode="text" onPress={() => onSort(sortKey, sortOrder, sortFilter === 'all' ? 'known' : 'all')} icon={sortFilter === 'all' ? 'filter-off' : 'filter'}>
        {sortFilter === 'all' ? '' : 'KiloVault'}
      </Button>


      <SegmentedButtons
        value={sortKey}
        onValueChange={value => onSort(value, sortOrder, sortFilter)}
        density='small'
        buttons={buttons.map(button => ({
          label: button.label,
          value: button.sortKey,
        }))}
      />

    </View>
  );
};

export default DeviceListHeader;