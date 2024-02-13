import React, {useState} from 'react';
import {Dimensions, StyleSheet, Text} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import {Shipment} from '../../types';
import {theme} from '../theme';

const w = Dimensions.get('screen').width;

const AccordionView = ({shipments}: {shipments: Shipment[]}) => {
  const accordionItems = [
    // {
    //   title: 'Description',
    //   content:
    //     'The platform-switched Laser-Lok collar creates a connective tissue attachment and retains crestal bone. Tapered Pro implants use the existing BioHorizons conical internal hex connections, maintaining compatibility with existing components and can be placed using existing BioHorizons Tapered surgical kits.',
    // },
    // {
    //   title: 'Payment',
    //   content:
    //     'The platform-switched Laser-Lok collar creates a connective tissue attachment and retains crestal bone. Tapered Pro implants use the existing BioHorizons conical internal hex connections, maintaining compatibility with existing components and can be placed using existing BioHorizons Tapered surgical kits.',
    // },
    {
      title: 'Delivery',
      content: `General Information:\nA large and well-organized warehouse enables us to ship packages one business day after purchase,\nBy doing this, we can ensure that our customers receive their packages as soon as possible.\n\nCustoms problems:\nWe make every effort to ensure that our customers are not charged any customs fees.\nOur customers can always count on us to be flexible and to offer them all the options they need.\n\nOur company will always assist the customer in making every effort, but we cannot be held liable for any issues with customs.\n\nDelivery times for premium delivery:\nShipments to USA & Europe - 1-4 days.\nDeliveries to the rest of the world - 4-10 days.\n\nDelivery times for regular deliveries:\nThe whole world - 14-27 days.\n\nMinimum order for free premium shipping:\n${
        !!shipments && shipments.length > 0
          ? shipments
              .map(item => {
                if (Number(item.price) === 0) {
                  return `${item.label} delivery will always be free.`;
                } else if (Number(item.free_from) > 0) {
                  return `${item.label} delivery - minimum order $${Number(
                    item.free_from,
                  )}.`;
                }
              })
              .join('\n')
          : ''
      }\n\nShipping costs:\n${
        !!shipments && shipments.length > 0
          ? shipments
              .map(item => {
                if (Number(item.price) === 0) {
                  return `${item.label} shipping at no cost.`;
                } else {
                  return `${item.label} shipping at $${Number(item.price)}.`;
                }
              })
              .join('\n')
          : ''
      }`, //.split(','),
    },
  ];
  //
  const [activeSections, setActiveSections] = useState<number[]>([]);

  const renderHeader = (item: {title: string; content: string}) => {
    return <Text style={styles.headerText}>{item.title}</Text>;
  };

  const renderContent = (item: {title: string; content: string}) => {
    return <Text style={styles.contentText}>{item.content}</Text>;
  };

  // _updateSections = activeSections => {
  //   this.setState({activeSections});
  // };

  return (
    <Accordion
      sections={accordionItems}
      activeSections={activeSections}
      renderHeader={renderHeader}
      renderContent={renderContent}
      onChange={setActiveSections}
      underlayColor="transparent"
      containerStyle={styles.accordionContainer}
      sectionContainerStyle={styles.accordionItem}
    />
  );
};

export default AccordionView;

const styles = StyleSheet.create({
  accordionContainer: {
    // maxWidth: 150,
    // overflow: 'hidden',
    marginHorizontal: (30 / 360) * w,
    marginBottom: (30 / 360) * w,
    borderTopWidth: (1 / 360) * w,
    borderTopColor: '#E3E3E3',
    backgroundColor: 'white',
    // marginTop: (15 / 360) * w,
  },
  accordionItem: {
    // maxWidth: 150,
    // overflow: 'hidden',
    borderBottomWidth: (1 / 360) * w,
    borderBottomColor: '#E3E3E3',
  },
  headerText: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '400',
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    paddingVertical: (15 / 360) * w,
  },
  contentText: {
    fontFamily: theme.fontFamily.SFProTextRegular,
    fontWeight: '400',
    fontSize: (12 / 360) * w,
    lineHeight: (16 / 360) * w,
    color: theme.primary,
    paddingBottom: (15 / 360) * w,
  },
});
