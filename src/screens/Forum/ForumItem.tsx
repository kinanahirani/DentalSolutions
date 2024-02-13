// import {useNavigation} from '@react-navigation/native';
// import React, {Dispatch, SetStateAction, useContext, useState} from 'react';
// import {useTranslation} from 'react-i18next';
// import {
//   Dimensions,
//   Image,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import AutoHeightImage from 'react-native-auto-height-image';
// import {Config} from '../../helpers/Config';
// import {BusinessStatus, ForumPost} from '../../helpers/types';
// import UserStore from '../../store/UserStore';
// import {Article} from '../../types';
// import {Button, Like, ModalWindow, PopupPost, Tag, Touchable} from '../../UI';
// import {theme} from '../../UI/theme';

// const {width} = Dimensions.get('screen');

// const ForumItem = ({
//   item,
//   setItems,
//   setLike,
//   deletePost,
// }: {
//   item: ForumPost;
//   setItems: Dispatch<SetStateAction<Article[]>>;
//   setLike: (
//     object_id: string,
//     myLike_id: string | null,
//     callback: (myLike_id: string | null) => void,
//   ) => void;
//   deletePost: (id: string) => void;
// }) => {
//   //
//   const {t} = useTranslation();

//   //
//   const storeUser = useContext(UserStore);

//   //
//   const {navigate} = useNavigation();

//   //
//   const [deletePostVisible, setDeletePostVisible] = useState(false);

//   return (
//     <>
//       <Touchable
//         onPress={() => {
//           navigate('Article', {
//             post_id: item._id,
//             onGoBack: (post: ForumPost) => {
//               setItems(i => i.map(p => (p._id === item._id ? post : p)));
//             },
//             deletePost,
//             setLike,
//             setListItems: setItems,
//           });
//         }}>
//         <View style={styles.forumItem}>
//           <View
//             style={{
//               paddingHorizontal: 16,
//               paddingTop: 16,
//               flex: 1,
//             }}>
//             <View
//               style={{
//                 flexDirection: 'row',
//                 alignItems: 'center',
//                 marginBottom: 16,
//               }}>
//               {/* <Image
//                 style={styles.forumLogo}
//                 source={
//                   !item.user_avatar
//                     ? require('../../UI/images/account_empty.png')
//                     : {uri: item.user_avatar.url}
//                 }
//               /> */}
//               <Image
//                 style={styles.forumLogo}
//                 source={
//                   item.user_business
//                     ? !item.user_avatar
//                       ? require('../../UI/images/account_empty.png')
//                       : {uri: item.user_avatar.url}
//                     : require('../../UI/images/logo_wer1.png')
//                 }
//               />

//               <View style={{flex: 1, paddingStart: 16}}>
//                 <Text style={styles.forumUserName}>
//                   {item.user_business ? item.user_name : t('Admin')}
//                 </Text>

//                 {item.user_business && (
//                   <Text style={styles.forumBusName}>{item.user_business}</Text>
//                 )}
//               </View>
//               {item.user_id === storeUser.user?._id && (
//                 <View style={{marginStart: 16}}>
//                   <PopupPost
//                     editPost={() =>
//                       navigate('AddNewPost', {
//                         post_id: item._id,
//                         onGoBack: (post: ForumPost) => {
//                           setItems(i => [
//                             ...i.map(p => (p._id === item._id ? post : p)),
//                           ]);
//                         },
//                       })
//                     }
//                     deletePost={() => {
//                       setTimeout(() => {
//                         setDeletePostVisible(true);
//                       }, 200);
//                     }}
//                   />
//                 </View>
//               )}
//             </View>

//             <Text style={styles.forumDesc} numberOfLines={2}>
//               {item.description}
//             </Text>

//             {!!item.photo && (
//               <AutoHeightImage
//                 width={width - 34 * 2}
//                 source={{uri: item.photo.url}}
//                 animated
//                 style={{marginBottom: 16}}
//               />
//             )}

//             <View style={{flexDirection: 'row'}}>
//               <View style={styles.forumTopicsView}>
//                 {!!item.topics &&
//                   item.topics.map(topic => (
//                     <Tag text={t(Config.forumTopic[topic].label)} key={topic} />
//                   ))}
//               </View>

//               <View style={{flexDirection: 'row'}}>
//                 {!!item.comments_count && (
//                   <Text style={styles.forumCount}>
//                     {item.comments_count.toString()}
//                   </Text>
//                 )}
//                 <TouchableOpacity
//                   hitSlop={{top: 15, bottom: 15, right: 15, left: 15}}
//                   onPress={() => {
//                     navigate('ForumPage', {
//                       post_id: item._id,
//                       onGoBack: (post: ForumPost) => {
//                         setItems(i =>
//                           i.map(p => (p._id === item._id ? post : p)),
//                         );
//                       },
//                       deletePost,
//                       setLike,
//                       setListItems: setItems,
//                       scrollToComment: true,
//                     });
//                   }}>
//                   <Image
//                     style={{width: 24, height: 24}}
//                     source={require('../../UI/images/message.png')}
//                   />
//                 </TouchableOpacity>

//                 <View style={{width: 24}} />
//                 {!!item.likes && (
//                   <Text style={styles.forumCount}>{item.likes.toString()}</Text>
//                 )}

//                 <Like
//                   like={!!item.myLike_id}
//                   setLike={() =>
//                     setLike(
//                       item._id,
//                       item.myLike_id,

//                       _id => {
//                         setItems(i =>
//                           i.map(p =>
//                             p._id === item._id
//                               ? {
//                                   ...p,
//                                   myLike_id: _id,
//                                   likes: p.likes + 1 * (_id ? 1 : -1),
//                                 }
//                               : p,
//                           ),
//                         );
//                       },
//                     )
//                   }
//                   active={
//                     storeUser.user?.business?.status === BusinessStatus.ACTIVE
//                   }
//                 />
//               </View>
//             </View>
//           </View>
//         </View>
//       </Touchable>

//       <ModalWindow
//         visible={deletePostVisible}
//         setVisible={setDeletePostVisible}>
//         <View style={{}}>
//           <Text style={styles.deleteText}>{t('Delete a post?')}</Text>

//           <View style={{flexDirection: 'row'}}>
//             <Button
//               label={t('Delete')}
//               onPress={() => {
//                 deletePost(item._id);
//                 setDeletePostVisible(false);
//               }}
//               style={{flex: 1}}
//             />
//             <View style={{width: 8}} />
//             <Button
//               label={t('Cancel')}
//               onPress={() => {
//                 setDeletePostVisible(false);
//               }}
//               style={{flex: 1}}
//               invert
//               border
//             />
//           </View>
//         </View>
//       </ModalWindow>
//     </>
//   );
// };

// export default ForumItem;

// const styles = StyleSheet.create({
//   forumItem: {
//     backgroundColor: 'white',
//     borderRadius: 8,
//     overflow: 'hidden',
//   },
//   forumLogo: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//   },
//   forumUserName: {
//     fontSize: 14,
//     color: theme.black,
//     fontFamily: theme.fontFamily.bold,
//     lineHeight: 20,
//     letterSpacing: 0.1,
//     textAlign: 'left',
//   },
//   forumBusName: {
//     fontSize: 14,
//     color: theme.gray,
//     fontFamily: theme.fontFamily.regular,
//     lineHeight: 20,
//     letterSpacing: 0.25,
//     opacity: 0.7,
//     textAlign: 'left',
//   },
//   forumDesc: {
//     fontSize: 14,
//     color: theme.gray,
//     fontFamily: theme.fontFamily.regular,
//     marginBottom: 16,
//     lineHeight: 20,
//     letterSpacing: 0.25,
//     opacity: 0.7,
//     textAlign: 'left',
//   },
//   forumCount: {
//     fontSize: 12,
//     color: theme.gray,
//     fontFamily: theme.fontFamily.regular,
//     lineHeight: 16,
//     letterSpacing: 0.4,
//     marginEnd: 4,
//     marginTop: 4,
//   },
//   forumTopicsView: {
//     flex: 1,
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     paddingBottom: 16,
//     borderBottomWidth: 1,
//     borderColor: '#E2E9F388',
//     marginTop: -4,
//   },
//   deleteText: {
//     textAlign: 'center',
//     color: theme.black,
//     fontFamily: theme.fontFamily.caption,
//     fontSize: 20,
//     letterSpacing: 0.15,
//     marginTop: 16,
//     marginBottom: 32,
//   },
// });
