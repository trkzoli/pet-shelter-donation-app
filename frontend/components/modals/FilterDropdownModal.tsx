import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const FILTER_OPTIONS = [
  'All',
  'Dogs',
  'Cats',
  'Hamsters',
  'Rabbits',
  'Fish',
  'Birds',
  'Reptiles',
  'Guinea Pigs',
  'Ferrets',
] as const;

export type FilterType = typeof FILTER_OPTIONS[number];

interface FilterDropdownModalProps {
  visible: boolean;
  activeFilter: FilterType;
  onFilterSelect: (filter: FilterType) => void;
  onClose: () => void;
}

const FilterDropdownModal: React.FC<FilterDropdownModalProps> = ({
  visible,
  activeFilter,
  onFilterSelect,
  onClose,
}) => {
  const handleFilterPress = (filter: FilterType) => {
    onFilterSelect(filter);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        onPress={onClose}
        activeOpacity={1}
      >
        <View style={styles.filterModal}>
          <Text style={styles.filterModalTitle}>Filter by Type</Text>
          
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {FILTER_OPTIONS.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterModalOption,
                  activeFilter === filter && styles.activeFilterModalOption
                ]}
                onPress={() => handleFilterPress(filter)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterModalText,
                  activeFilter === filter && styles.activeFilterModalText
                ]}>
                  {filter}
                </Text>
                {activeFilter === filter && (
                  <Ionicons name="checkmark" size={20} color="#E4E0E1" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  filterModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  filterModalTitle: {
    fontSize: 18,
    fontFamily: 'PoppinsBold',
    color: '#493628',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollContainer: {
    maxHeight: 300, 
  },
  filterModalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeFilterModalOption: {
    backgroundColor: '#493628',
  },
  filterModalText: {
    fontSize: 16,
    fontFamily: 'PoppinsRegular',
    color: '#1F2029',
  },
  activeFilterModalText: {
    color: '#E4E0E1',
    fontFamily: 'PoppinsSemiBold',
  },
});

export default FilterDropdownModal;