import React from 'react';
import { View } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';


export type SortKey = string;
export type SortOrder = 'asc' | 'desc';

export interface SortButtonDefinition {
  sortKey: SortKey;
  label: string;
}

interface SortButtonProps {
  definition: SortButtonDefinition;
  isActive: boolean;
  sortOrder: SortOrder;
  onPress: (sortKey: SortKey, sortOrder: SortOrder) => void;
}

// const SortButton = ({ definition, isActive, sortOrder, onPress }: SortButtonProps) => {
//   // log.debug("Rendering SortButton with definition: ", definition, " isActive: ", isActive, " order: ", sortOrder);

//   const arrow = sortOrder === 'asc' ? '↑' : '↓';

//   return (
//     <Chip
//       selected={isActive}
//       onPress={() => onPress(definition.sortKey, sortOrder)}
//       showSelectedOverlay
//       compact
//     >
//       {definition.label}{isActive ? ` ${arrow}` : ''}
//     </Chip>
//   );
// };


interface DeviceListHeaderProps {
  buttons: SortButtonDefinition[];
  sortKey: string;
  sortOrder: SortOrder;
  onSort: (key2: SortKey, order: SortOrder) => void;
}

const DeviceListHeader = ({ buttons, sortKey, sortOrder, onSort }: DeviceListHeaderProps) => {
  // log.debug("Rendering DeviceListHeader with buttons: ", buttons, " key: ", sortKey, " order: ", sortOrder);

  return (  
      <View style={{ padding: 12, backgroundColor: 'transparent' }}>
        {


          <SegmentedButtons
            value={sortKey}
            onValueChange={value => onSort(value, sortOrder)}
            density='small'
            buttons={buttons.map(button => ({
              label: button.label,
              value: button.sortKey,
            }))}
          />
        }
      </View>
  );
};

export default DeviceListHeader;