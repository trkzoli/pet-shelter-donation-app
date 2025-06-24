import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  sectionKey: string;
  petId: string;
  defaultExpanded?: boolean;
  canClose?: boolean;
  onToggle?: (petId: string, sectionKey: string, isExpanded: boolean) => void;
  titleFontSize?: number;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = React.memo(({
  title,
  children,
  sectionKey,
  petId,
  defaultExpanded = false,
  canClose = true,
  onToggle,
  titleFontSize = 18,
}) => {

  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const handlePress = () => {
    if (canClose) {
      const newExpandedState = !isExpanded;
      setIsExpanded(newExpandedState);
      
      onToggle?.(petId, sectionKey, newExpandedState);
    }
  };

  return (
    <View style={styles.expandableSection}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={handlePress}
        disabled={!canClose}
        activeOpacity={canClose ? 0.7 : 1}
        accessibilityRole="button"
        accessibilityLabel={`${isExpanded ? 'Collapse' : 'Expand'} ${title} section`}
      >
        <Text style={[styles.sectionTitle, { fontSize: titleFontSize }]}>
          {title}
        </Text>
        {canClose && (
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#493628"
          />
        )}
      </TouchableOpacity>
      
      {isExpanded && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );
});

ExpandableSection.displayName = 'ExpandableSection';

const styles = StyleSheet.create({
  expandableSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D6C0B3',
  },
  sectionTitle: {
    fontFamily: 'PoppinsBold',
    color: '#493628',
  },
  sectionContent: {
    paddingTop: 12,
  },
});

export default ExpandableSection;